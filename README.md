# HostelCart 🛒

> **Shop Together. Save Together. No Unnecessary Items.**

HostelCart is a hostel-focused quick-commerce group-order coordination web application. It helps students combine their shopping requirements for **Blinkit**, **Zepto**, and **Swiggy Instamart** to reach applicable minimum cart thresholds without buying unwanted products.

---

## 🌟 Key Features

- **Hostel-Scoped Sessions:** Orders are private and restricted to verified members of a hostel.
- **Platform Specific:** Dedicated order flows for Blinkit, Zepto, and Swiggy Instamart.
- **Live Group Cart:** Real-time visibility into shared items, participant subtotals, and progress towards the minimum threshold.
- **Manual & Product URL Entry:** Add items manually or paste platform links with manual name and price confirmation.
- **Integer Paise Precision:** All calculations use integer paise to eliminate floating-point rounding errors.
- **Proportional Sharing:** Transparent, deterministic allocation of checkout fees (delivery, taxes, platform charges).
- **External Payment Tracking:** Records participant payment acknowledgements without directly holding or processing money.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + TypeScript |
| **Styling** | Tailwind CSS + Lucide React |
| **Routing** | React Router v6 |
| **Backend & DB** | Firebase (Auth, Cloud Firestore, Cloud Functions) |
| **Testing** | Vitest + React Testing Library |
| **Deployment** | Vercel (Frontend) + Firebase (Rules & Functions) |

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **Git**

### 2. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repository-url>
cd "Hostel Cart"

# Install dependencies
npm install
```

### 3. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase project credentials from the [Firebase Console](https://console.firebase.google.com/):

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# Set to true if using local Firebase emulators
VITE_USE_FIREBASE_EMULATOR=false
```

> **Note:** The application will run smoothly in local demo mode even if placeholder credentials are used. A banner will clearly indicate development mode.

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Tests

HostelCart includes comprehensive unit tests for calculations, money conversions, and URL validations:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 🔒 Firebase Configuration & Deployment

### Firestore Security Rules
Deploy security rules to safeguard user data:

```bash
firebase deploy --only firestore:rules
```

### Firebase Cloud Functions
Deploy background recalculation and verification functions:

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub / GitLab.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your HostelCart repository.
4. Set the Framework Preset to **Vite**.
5. Add the environment variables from your `.env` file under **Environment Variables**.
6. Click **Deploy**.

`vercel.json` is pre-configured with SPA rewrites and standard security headers.

---

## 📜 Disclaimer

HostelCart is an independent coordination tool designed for hostel students. It does not place orders, take commissions, or process banking transactions. Third-party checkout (Blinkit, Zepto, Swiggy Instamart) is completed independently by the organizer.
