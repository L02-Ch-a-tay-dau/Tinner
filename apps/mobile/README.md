# Tinner Mobile (Expo)

## Run on phone

1. Install dependencies from workspace root:

```bash
pnpm install
```

2. Set API endpoint in `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://<your-lan-ip>:3000
```

3. Start Expo:

```bash
pnpm --filter @tinner/mobile start
```

4. Open Expo Go and scan the QR code.