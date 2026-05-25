# 📋 Assignment 3 Progress Checklist: Tinner Application

Welcome to the progress checklist for **Tinner**! This document maps out all required sections, features, deliverables, and evaluation criteria for Assignment 3, linked to the corresponding codebase files and LaTeX documents for seamless updates.

---

## 📊 Project Completion Summary

| Category | Requirements | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Section 1: Final Report** | 11 Core Parts + Criteria | `[ 11 / 11 ]` | LaTeX report sections completed |
| **Section 2: Runnable Product** | APK, Google Drive, Backend | `[ 1 / 3 ]` | Backend & config integration completed |
| **Section 3: Product Distribution** | Poster, Landing Page, Survey, Analytics | `[ 2 / 5 ]` | Landing page deployed & Sentry active |

---

## 📑 Section 1: Final Report (20%)
*All final report sections are being compiled into the LaTeX template located at [latex/sections/](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections).*

- [Done] **1. Introduction**
  - [Done] Problem statement defined
  - [Done] Project objectives & purpose outlined
  - [Done] Real-world need & potential impact addressed
  - 📂 **Target File:** [1-Introduction.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/1-Introduction.tex)

- [Done] **2. Approach and Methodology**
  - [Done] Development process described (Agile/Scrum practices)
  - [Done] Collaboration tools documented (e.g., GitHub monorepo, PR workflow)
  - [Done] Decision-making rationale for tech stack
  - 📂 **Target File:** [2-ApproachAndMethodology.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/2-ApproachAndMethodology.tex)

- [Done] **3. Application Features and Functionality**
  - [Done] Core Minimum Viable Product (MVP) features outlined
  - [Done] Advanced functionalities detailed (e.g., AI matchmaking/rating, geolocation)
  - 📂 **Target File:** [3-ApplicationFeatures.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/3-ApplicationFeatures.tex)

- [Done] **4. Implementation Details**
  - [Done] Frontend tools & frameworks (React Native, Expo, TypeScript)
  - [Done] Backend tools & frameworks (NestJS, Prisma, PostgreSQL, Redis)
  - [Done] Libraries, key packages, and dependency maps
  - 📂 **Target File:** [4-ImplementationDetails.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/4-ImplementationDetails.tex)

- [Done] **5. User Experience (UX)**
  - [Done] MVP user flow detailed
  - [Done] High-fidelity wireframes/screenshots illustrating navigation & interaction
  - 📂 **Target File:** [5-UserExperience.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/5-UserExperience.tex)

- [Done] **6. System Architecture**
  - [Done] Complete architecture diagram (Frontend, Backend, Database, Redis caching, AI service)
  - [Done] Explanation of components and data flow
  - 📂 **Target File:** [6-SystemArchitecture.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/6-SystemArchitecture.tex)

- [Done] **7. Web Service Design**
  - [Done] Backend REST API structure & endpoints
  - [Done] Security practices (JWT authentication, bcrypt hashing)
  - [Done] Input validation (class-validator, class-transformer)
  - [Done] API documentation (NestJS Swagger)
  - 📂 **Target File:** [7-WebServiceDesign.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/7-WebServiceDesign.tex)

- [Done] **8. Deployment Strategy**
  - [Done] App and backend cloud hosting detailed (e.g., Render, Railway, Vercel)
  - [Done] CI/CD pipeline automation details (GitHub Actions, build steps)
  - 📂 **Target File:** [8-DeploymentStrategy.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/8-DeploymentStrategy.tex)

- [Done] **9. Testing Coverage Report**
  - [Done] Code coverage metrics from Jest (Backend targets at least 70% coverage on core modules)
  - [Done] Analysis of tested modules & identifying coverage gaps
  - [Done] Quality improvement suggestions based on tests
  - 📂 **Target File:** [9-TestingCoverageReport.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/9-TestingCoverageReport.tex)

- [Done] **10. User Satisfaction Survey Analysis & User Behavior Analytics**
  - [Done] Quantitative data from surveys analyzed (e.g., satisfaction scores, UI/UX feedback)
  - [Done] Quantitative metrics from analytics integrated (session duration, feature usage via Sentry/Firebase)
  - 📂 **Target File:** [10-UserSatisfactionAndAnalytics.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/10-UserSatisfactionAndAnalytics.tex)

- [Done] **11. Project Evaluation and Areas for Improvement**
  - [Done] Successful achievements & challenges faced
  - [Done] Key lessons learned
  - [Done] Next-phase/future enhancement proposals
  - 📂 **Target File:** [11-ProjectEvaluation.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/11-ProjectEvaluation.tex)

### 🧐 Report Evaluation Criteria Check:
- [Done] **Necessity & Practicality:** Clear real-world value & innovation demonstrated.
- [Done] **Problem Solving:** App successfully delivers value & solves target problems.
- [Done] **UI/UX Standards:** Interface adheres to design standards (Material Design / Apple HIG).
- [Done] **Formatting & Grammar:** Professional layout, zero grammar/spelling errors.
- [Done] **Visual Prudence:** Logical use of clean diagrams instead of excessive imagery.
- [ ] **Naming Convention:** Final report named `<group_name>_report.pdf` compiled via LaTeX.

---

## 📱 Section 2: Runnable Product (40%)
*Building, packaging, and verifying the physical Android application.*

- [ ] **1. Single APK Build**
  - [ ] Build standalone APK for Android 13 (API Level 33) compatibility
  - [ ] Target configuration verification in `apps/mobile/package.json`
  - 📂 **Target Folder:** [apps/mobile](file:///d:/HCMUT/CO3043-PTAD/Tinner/apps/mobile)

- [ ] **2. Google Drive Distribution**
  - [ ] Upload APK to Google Drive
  - [ ] Make link shareable (anyone with link can view/download)
  - [ ] Place the download link clearly inside the report:
    - 📂 **Target File:** [12-RunnableProduct.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/12-RunnableProduct.tex)

- [Done] **3. Backend & Config Integrity**
  - [Done] Successful integration with deployed backend web services
  - [Done] Secure config management (e.g., API keys, environment variables hidden from repository)
  - 📂 **Backend Folder:** [apps/backend](file:///d:/HCMUT/CO3043-PTAD/Tinner/apps/backend)

### 🧐 Product Evaluation Criteria Check:
- [ ] **Smooth Installation:** APK installs perfectly on test devices (Android 13).
- [ ] **Stability & Features:** No crashes or major bugs encountered during testing.
- [ ] **Responsive Design:** UI displays perfectly across various device screens/aspect ratios.

---

## 📢 Section 3: Product Distribution and Survey (40%)
*Validating the Tinner application in the real world through user analytics and feedback.*

- [ ] **1. Promotional Assets**
  - [ ] A0-sized promotional poster highlighting core features and value proposition
  - [Done] Deployed Landing Page to promote the app
  - 📂 **Target File:** [13-ProductDistributionAndSurvey.tex](file:///d:/HCMUT/CO3043-PTAD/Tinner/latex/sections/13-ProductDistributionAndSurvey.tex)

- [ ] **2. User Feedback Survey**
  - [ ] Google Forms survey covering usability, satisfaction, and suggestions
  - [ ] Feedback collected from at least **five users** outside the development group

- [Done] **3. App Metrics & Analytics Collector**
  - [Done] Integration of `@sentry/react-native` inside the mobile client
  - [Done] Track crash reports, performance issues, and user engagement
  - [Done] Analyze findings and export dashboard insights to the report

- [ ] **4. Verification Links & Analysis**
  - [ ] Include link to promotional poster (PDF) in report
  - [ ] Include link to the user survey in report
  - [ ] Include detailed feedback and user behavior metrics analysis in report

- [ ] **5. Photographic Evidence**
  - [ ] Compile screenshots or photos of at least five real users interacting with the application
  - [ ] Embed the photos ethically in the report

### 🧐 Distribution Evaluation Criteria Check:
- [ ] **Poster Quality:** Eye-catching, creative, and professional A0 poster layout.
- [ ] **Survey Depth:** Deep questions validating both UI/UX and usability values.
- [ ] **Metrics Efficacy:** Sentry analytics used properly with concrete data.
- [ ] **Genuine Evidence:** Explicit proof of 5 different users testing the app.

---

## 📝 Additional Notes & Best Practices

- [ ] **Single PDF submission** including all workspace/figma/APK links.
- [Done] **Complete GitHub monorepo documentation** including READMEs, setup instructions, CI/CD status, and test runs.
- [Done] **Environment Security:** Ensure no secrets or `.env` files are tracked in version control.
- [Done] **Advanced Features:** Highlight advanced aspects like Redis caching, Swagger documentation, and AI matchmaking in the report.

---

*Tip: Use standard GitHub-style checkboxes to mark tasks as complete!*
