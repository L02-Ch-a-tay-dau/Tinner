# 📖 Tài liệu Kỹ thuật Chi tiết Dự án Tinner (Tinner Technical Documentation)

Dự án **Tinner** (ghép từ *"Tinder"* và *"Dinner"*) là một ứng dụng di động hoạt động theo triết lý **"Swipe To Bite"**, nhằm giải quyết triệt để tình trạng mệt mỏi khi ra quyết định (*Decision Fatigue*) và sự quá tải thông tin (*Choice Overload*) khi chọn địa điểm ăn uống. Tài liệu này cung cấp cái nhìn toàn diện về kiến trúc hệ thống, các module nghiệp vụ, quy trình triển khai và hướng dẫn vận hành dự án.

---

## 🗺️ 1. Sơ đồ Kiến trúc Hệ thống (System Architecture)

Hệ thống được thiết kế theo mô hình **Client-Server** chuẩn hóa, phân chia thành 4 tầng riêng biệt nhằm tối ưu hóa tính độc lập và khả năng bảo trì:

```mermaid
flowchart TB
  subgraph Clients [Tầng Client]
    Mobile[Expo React Native App]
    Web[Vite React Web - Tham chiếu]
  end

  subgraph Backend [NestJS Backend Server - Render]
    API[REST API /api/v1/*]
    Guard[JWT Auth Guard & Global Filters]
    Auth[Auth Module - Xác thực]
    Domain[Dishes / Filters / Interactions]
    Suggest[Suggestions Module - DB-First Cache]
    Prisma[Prisma ORM]
  end

  DB[(PostgreSQL Database - Aiven Cloud)]
  Overpass[Overpass API - OpenStreetMap]

  Mobile -->|HTTP REST| API
  Web -->|HTTP REST| API
  API --> Guard
  Guard --> Auth
  Guard --> Domain
  Guard --> Suggest
  Auth --> Prisma
  Domain --> Prisma
  Suggest --> Prisma
  Prisma --> DB
  Suggest -.->|Cache Miss - Sync 7km| Overpass
```

### Chi tiết các tầng công nghệ:
1. **Client Layer:**
   * **Mobile client:** Ứng dụng chính phát triển bằng **Expo SDK 54** (React Native, TypeScript). Luồng native chính tích hợp Metro Bundler hỗ trợ pnpm workspaces.
   * **Web client:** Single Page Application phát triển bằng Vite + React, phục vụ làm landing page giới thiệu sản phẩm.
2. **API Layer (NestJS 11):**
   * Sử dụng global middleware bao gồm `cookie-parser`, `ValidationPipe` toàn cục, và `GlobalExceptionFilter` để chuẩn hóa toàn bộ cấu trúc lỗi phản hồi về cho client.
   * Expose API tài liệu hóa trực tiếp qua Swagger UI tại `/api/docs`.
3. **Data Layer (PostgreSQL 16 & Prisma 7):**
   * Kết nối cơ sở dữ liệu PostgreSQL được quản lý trên nền tảng đám mây **Aiven** bắt buộc sử dụng mã hóa SSL (`sslmode=require`).
   * Sử dụng Prisma ORM để quản lý schema (`schema.prisma`), tự động tạo migration và seed dữ liệu mẫu cho 16 món ăn Việt Nam mặc định.
4. **Third-party Integration:**
   * Tích hợp **Overpass API** (dữ liệu bản đồ mở OpenStreetMap) để đồng bộ hóa nhà hàng và các địa điểm ăn uống xung quanh tọa độ của người dùng hoàn toàn miễn phí.

---

## ⚙️ 2. Tổ chức Mã nguồn (Monorepo Directory Structure)

Dự án áp dụng mô hình quản lý monorepo sử dụng công nghệ **pnpm workspace**, giúp đồng bộ hóa các package dùng chung giữa backend và mobile client một cách nhanh chóng.

```text
Tinner/
├── apps/
│   ├── backend/          # REST API xây dựng bằng NestJS 11 + Prisma
│   │   ├── src/          # Mã nguồn NestJS (Auth, Suggestions, Interactions, v.v.)
│   │   ├── test/         # Kịch bản kiểm thử tích hợp & E2E (Jest)
│   │   ├── Dockerfile    # Docker build phục vụ deploy lên Render
│   │   └── prisma/       # Schema, Migrations và Seed file cơ sở dữ liệu
│   └── mobile/           # Ứng dụng di động React Native (Expo SDK 54)
│       ├── App.tsx       # Entry point tích hợp Sentry SDK
│       ├── app-native/   # Mã nguồn chính (AppShell, các màn hình screens)
│       └── app.json      # File cấu hình Expo ứng dụng di động
├── packages/
│   ├── types/            # DTO và Enum dùng chung giữa Backend và Mobile
│   └── api-client/       # Typed API client phục vụ kết nối dữ liệu
├── latex/                # Mã nguồn báo cáo LaTeX hoàn chỉnh (Assignment 3)
├── docker-compose.yml    # Cấu hình container chạy local Postgres + Backend
└── package.json          # Quản lý script monorepo chính
```

---

## 🧠 3. Các Luồng Nghiệp vụ Cốt lõi (Core Business Flows)

### 3.1. Luồng Gợi ý Nhà hàng thông minh (Suggestions DB-First Cache)
Để giảm thiểu độ trễ tối đa cho ứng dụng di động và tránh bị giới hạn băng thông (rate limit) từ các dịch vụ bản đồ bên thứ ba, `SuggestionsService` áp dụng chiến lược **DB-First Caching**:

```text
[Yêu cầu gợi ý từ Client (lat, lng)]
                 │
                 ▼
     [Kiểm tra DB cục bộ] ── Đủ dữ liệu (>= 20 nhà hàng đã sync < 7 ngày) ──► [Trả kết quả từ DB]
                 │ (Thiếu dữ liệu / Quá hạn)
                 ▼
[Gửi Query tới Overpass API (bán kính 7km)]
                 │
                 ▼
  [Phân tích món ăn dựa trên tên/cuisine]
                 │
                 ▼
[Bulk Insert vào DB bằng prisma.createMany]
                 │
                 ▼
  [Lọc theo Haversine Distance & Shuffle] ──► [Trả kết quả về Client]
```

* **Hiệu năng vượt trội:** Lần quét đầu tiên của một khu vực mới chỉ mất khoảng 5–10 giây (do cần đồng bộ Overpass). Các yêu cầu tiếp theo tại cùng khu vực chỉ tốn khoảng **~300ms** do được phục vụ trực tiếp từ cơ sở dữ liệu PostgreSQL.

### 3.2. Luồng Xác thực 2 tầng bảo mật (JWT Rotation)
Ứng dụng sử dụng cơ chế bảo mật Token xoay vòng an toàn:
1. **Access Token:** Có vòng đời ngắn (15 phút), được gửi trong header `Authorization: Bearer <token>` để xác thực mọi request.
2. **Refresh Token:** Có vòng đời dài (30 ngày), lưu mã băm (hash) trong bảng `refresh_tokens` của Database. Client dùng token này để xoay vòng lấy Access Token mới tại endpoint `/api/v1/auth/refresh`.
3. **Đăng xuất an toàn:** Khi gọi đăng xuất, bản ghi Refresh Token tương ứng sẽ bị xóa vĩnh viễn trong cơ sở dữ liệu để chặn hoàn toàn hành vi chiếm đoạt token.

### 3.3. Luồng Bộ lọc thông minh (Smart Filters & Custom Preferences)
Hệ thống Tinner cho phép cá nhân hóa trải nghiệm ăn uống của người dùng dựa trên cơ chế lọc thông minh hoạt động đồng bộ giữa Client và Backend.

#### 1. Schema Cơ sở dữ liệu (`UserFilter` Model)
Cấu hình bộ lọc được lưu trữ trực tiếp trong cơ sở dữ liệu PostgreSQL thông qua bảng `user_filters`, có quan hệ 1-1 với bảng `users`:
* `cuisines`: Danh sách các loại hình ẩm thực yêu thích (ví dụ: Cafe, Hải sản, Đồ ăn Hàn Quốc,...).
* `price_ranges`: Phân khúc giá chấp nhận được, bao gồm các mức từ `$` đến `$$$$`.
* `max_distance_km`: Bán kính tìm kiếm tối đa (từ 1.0 km đến 7.0 km).
* `min_rating`: Điểm đánh giá tối thiểu (từ 0 đến 5 sao).

#### 2. Kiến trúc Xử lý Bộ lọc 2 Cấp (Filter Processing Pipeline)
Khi người dùng thực hiện vuốt thẻ gợi ý, Backend sẽ áp dụng bộ lọc theo quy trình tối ưu hiệu năng sau:

```text
[Suggestions REST Request /api/v1/suggestions]
                   │
                   ▼
     [Tải Bộ lọc từ Database] 
                   │ (Lấy maxDistanceKm, minRating, cuisines, priceRanges)
                   ▼
  [Lọc theo Bounding Box địa lý (BBox)] ──► Tối ưu hóa truy vấn Database
                   │ (Tọa độ người dùng ± Delta Lat/Lng tương ứng maxDistanceKm)
                   ▼
     [Tìm kiếm Địa điểm cục bộ] ──► Lọc nhà hàng có rating >= minRating
                   │
                   ▼
  [Tính khoảng cách Haversine chính xác] ──► Loại bỏ địa điểm ngoài maxDistanceKm
                   │
                   ▼
     [Bộ lọc Loại hình ẩm thực] ──► Mở rộng Cuisines qua CUISINE_FILTER_ALIASES
                   │ (Đồ uống -> Cafe/Trà sữa; Bánh mì -> Bánh mì/Gà rán/Pizza)
                   ▼
         [Bộ lọc Phân khúc giá] ──► So khớp priceLevel (1 đến 4)
                   │
                   ▼
      [Xáo trộn ngẫu nhiên (Shuffle)] ──► Trả kết quả gợi ý về Mobile
```

* **Tối ưu Bounding Box (BBox) địa lý:** Để tránh việc tính toán khoảng cách Haversine đắt đỏ trên hàng chục nghìn nhà hàng trong DB, Backend sử dụng công thức tính Bounding Box hình chữ nhật sơ bộ:
  $$\Delta_{\text{Lat}} = \frac{\text{maxDistanceKm}}{111}$$
  $$\Delta_{\text{Lng}} = \frac{\text{maxDistanceKm}}{111 \times \cos\left(\text{Lat} \times \frac{\pi}{180}\right)}$$
  Truy vấn cơ sở dữ liệu chỉ quét các nhà hàng có tọa độ nằm trong khoảng $[\text{Lat} - \Delta_{\text{Lat}}, \text{Lat} + \Delta_{\text{Lat}}]$ và $[\text{Lng} - \Delta_{\text{Lng}}, \text{Lng} + \Delta_{\text{Lng}}]$, giảm tới 95% số lượng bản ghi cần xử lý ở tầng ứng dụng.
* **Haversine Filtering:** Sau khi lọc nhanh bằng BBox, hệ thống tính toán chính xác khoảng cách Haversine giữa tọa độ thực tế của người dùng và địa điểm trước khi sắp xếp và trả về kết quả.
* **Cuisine Aliasing:** Để tăng độ khớp của bộ lọc, hệ thống hỗ trợ ánh xạ mở rộng (aliasing). Ví dụ, khi chọn bộ lọc "Đồ uống & Cafe", hệ thống tự động lọc các nhà hàng có nhãn ẩm thực thuộc cả hai nhóm "Cafe" và "Trà sữa".

---

## 🛠️ 4. Hướng dẫn Chạy Cục bộ (Local Setup & Development)

### 📋 Yêu cầu hệ thống:
* **Node.js** phiên bản 22 trở lên.
* Trình quản lý gói **pnpm** (phiên bản 10+).
* Công cụ **Docker** (để chạy database cục bộ).

### 🚀 Các bước khởi động nhanh:

1. **Cài đặt các gói phụ thuộc:**
   ```bash
   pnpm install
   ```

2. **Khởi chạy PostgreSQL cục bộ qua Docker:**
   ```bash
   docker compose up -d postgres
   ```

3. **Cấu hình môi trường cho Backend:**
   Sao chép file cấu hình mẫu tại `apps/backend/.env.example` thành `apps/backend/.env` và thiết lập các tham số:
   ```env
   DATABASE_URL="postgres://postgres:postgres@localhost:5432/tinner?schema=public"
   JWT_ACCESS_SECRET="chọn_một_mã_bí_mật_ngẫu_nhiên"
   JWT_REFRESH_SECRET="chọn_một_mã_bí_mật_khác"
   ```

4. **Đồng bộ hóa Database schema & Seed dữ liệu mẫu:**
   ```bash
   pnpm --filter @tinner/backend prisma:generate
   pnpm --filter @tinner/backend prisma:migrate
   pnpm --filter @tinner/backend prisma:seed
   ```

5. **Chạy Backend ở chế độ phát triển (Port 3000):**
   ```bash
   pnpm dev:backend
   ```

6. **Chạy ứng dụng di động Expo (Terminal khác):**
   Đảm bảo đã khai báo `EXPO_PUBLIC_API_BASE_URL` trong file `apps/mobile/.env` trỏ về IP máy tính của bạn (hoặc `http://localhost:3000`).
   ```bash
   pnpm dev:mobile
   ```

---

## 🧪 5. Kiểm thử Hệ thống (Testing & Coverage Report)

Hệ thống được kiểm thử tự động toàn diện bằng framework **Jest** và thư viện **Supertest** để kiểm chứng hoạt động tích hợp của toàn bộ API REST:

```text
PASS  test/auth.e2e-spec.ts (2.12s)
PASS  test/suggestions.e2e-spec.ts (1.89s)
PASS  test/interactions.e2e-spec.ts (1.45s)
PASS  test/filters.e2e-spec.ts (1.02s)
...
Test Suites: 6 passed, 6 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        4.82s
```

### 📊 Bảng thống kê độ phủ sóng kiểm thử (Code Coverage):
| Module Nghiệp vụ | % Statements | % Branch | % Functions | % Lines |
| :--- | :--- | :--- | :--- | :--- |
| **Toàn bộ hệ thống** | **97.44%** | **79.68%** | **98.03%** | **97.33%** |
| `src/auth` (Xác thực) | 100.00% | 80.64% | 100.00% | 100.00% |
| `src/suggestions` (Gợi ý) | 93.10% | 85.36% | 93.10% | 93.12% |
| `src/interactions` (Tương tác) | 100.00% | 81.81% | 100.00% | 100.00% |

* **Lệnh chạy kiểm thử local:**
  ```bash
  # Chạy unit test
  pnpm --filter @tinner/backend test
  # Chạy báo cáo độ bao phủ
  pnpm --filter @tinner/backend test:cov
  ```

---

## 🚀 6. Chiến lược Triển khai dự án (Deployment Strategy)

Kiến trúc sản xuất (Production Deployment) được tách thành các phần nhỏ dựa trên các dịch vụ điện toán đám mây chuyên biệt để đạt hiệu năng tốt nhất:

| Thành phần | Nền tảng triển khai | Runtime / Cấu hình chính |
| :--- | :--- | :--- |
| **Database** | **Aiven Cloud** | Managed PostgreSQL 16 + Auto-backup PITR + Bắt buộc kết nối SSL. |
| **Backend REST API** | **Render** | Chạy dạng Docker container trích xuất từ `apps/backend/Dockerfile`. Cơ chế tự động deploy (`autoDeploy: true`) khi push lên nhánh chính. |
| **Frontend Web** | **Vercel** | Triển khai Static Edge Hosting cho bản web demo. |
| **Mobile App (APK)** | **EAS Cloud** | Sử dụng Expo Application Services để đóng gói file APK tương thích hoàn hảo với Android 13 (API Level 33). |

---

## 📈 7. Giám sát & Quản lý Sự cố (Monitoring & Sentry Analytics)

Dự án di động Tinner được tích hợp sẵn **Sentry SDK** (`@sentry/react-native`) trực tiếp tại root component (`App.tsx`).

### Các tính năng giám sát đang hoạt động:
* **Theo dõi lỗi thời gian thực:** Tự động bắt toàn bộ các sự cố crash, lỗi logic UI/UX và đồng bộ lỗi lên Sentry dashboard.
* **Đo lường hiệu năng:** Giám sát thời gian phản hồi của API, tốc độ tải các màn hình và trải nghiệm vuốt thẻ của người dùng.
* **Thu thập phản hồi:** Tích hợp trực tiếp `Sentry.feedbackIntegration()` giúp người dùng có thể gửi báo cáo lỗi kèm ảnh chụp màn hình trực tiếp về cho đội ngũ phát triển.

---
Tài liệu được cập nhật tự động và đồng bộ với cấu trúc dự án thực tế.
