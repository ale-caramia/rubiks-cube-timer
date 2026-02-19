# 🎲 Rubik's Cube Timer

A professional Progressive Web App (PWA) for timing Rubik's Cube solves, with session management, detailed statistics, and offline support.

![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.5-646cff?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.18-06b6d4?logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Enabled-5a0fc8?logo=pwa)

## ✨ Features

### 🎯 Professional Timer
- **Accurate timer** with centisecond precision
- **Hold to Start system** - hold to prepare, release to start
- **Visual state indicators** with color coding (yellow, green, red, blue)
- **Automatic scramble generator** for each solve (30 random moves)

### 📊 Session Management
- **Multiple sessions** - organize your times in separate sessions
- **Rename sessions** - customize your session names
- **Quick switching** - easily switch between different sessions
- **Persistent storage** - data is automatically saved with Firebase

### 📈 Detailed Statistics
- **Best/Worst Time** - track your best and worst times per session
- **Average** - mean solving time
- **Solve counter** - total number of solves
- **Global statistics** - view stats across all sessions
- **Last 10 solves** - see your most recent times

### 📱 Progressive Web App
- ✅ **Installable** as a native app on desktop and mobile
- ✅ **Works offline** after first visit
- ✅ **Auto-update** for new versions
- ✅ **Smart caching** of all resources
- ✅ **Custom icons** with Rubik's Cube design
- ✅ **Mobile optimized** with portrait orientation

### 🎨 Design
- **Neobrutalism style** with thick borders and vibrant colors
- **Responsive** - works perfectly on all devices
- **Accessible** - clear and intuitive interface
- **Animations** - smooth transitions and visual feedback


## 🔐 Firebase Configuration

Create a `.env` file with these variables:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> Note: Firebase web config values are safe to expose in client code. Security is enforced by Firebase Auth and Firestore Rules.

The app now supports:
- Google Login (Firebase Auth)
- Per-user cloud persistence (Firestore)
- One-click migration from legacy local storage
- Cube mode preference persistence


## 🚀 Deploy automatico su merge in `main`

È stata aggiunta la GitHub Action `.github/workflows/deploy-main.yml` che:
- si attiva su `push` al branch `main` (quindi anche dopo merge di PR),
- esegue `npm ci` e `npm run build`,
- pubblica su Firebase Hosting canale `live`.

Configura questi **GitHub Secrets** nel repository:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT` (JSON dell'account di servizio Firebase, come stringa)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

> Nota: `FIREBASE_PROJECT_ID` (deploy) e `VITE_FIREBASE_PROJECT_ID` (build client) possono avere lo stesso valore, ma sono mantenuti separati per chiarezza.

## 🚀 Installation and Usage

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd rubiks-cube-timer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
# Create optimized build
npm run build

# Preview the build
npm run preview
```

## 📱 Install as PWA

### Desktop (Chrome/Edge)
1. Open the app in your browser
2. Click the "Install" icon in the address bar
3. Or: Menu → Install Rubik's Timer

### iOS (Safari)
1. Open the app in Safari
2. Tap the "Share" button
3. Scroll and tap "Add to Home Screen"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the three dots
3. Tap "Install app"

## 🛠️ Technologies Used

### Core
- **React 19.2** - UI library with latest features
- **TypeScript** - Complete type safety
- **Vite (Rolldown)** - Ultra-fast build tool

### Styling
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Lucide React** - Modern and clean icons

### PWA & Storage
- **vite-plugin-pwa** - Automatic service worker generation
- **Workbox** - Advanced caching strategies
- **Firebase** - Backend as a Service for persistent storage

### Dev Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific rules
- **Sharp** - PWA icon generation

## 📁 Project Structure

```
rubiks-cube-timer/
├── public/
│   ├── icon.svg              # Source Rubik's Cube icon
│   ├── icons/                # Icons folder
├── src/
│   ├── components/
│   │   ├── common/            # Reusable UI components
│   │   └── layout/            # App layout + navigation
│   ├── hooks/                 # Reusable hooks (wake lock, confirm dialog)
│   ├── pages/                 # Routed pages (Timer, Sessions, Statistics)
│   ├── state/                 # Sessions context + persistence
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Scramble, stats, time formatting
│   ├── firebase.ts            # Firebase configuration
│   ├── App.tsx                # Router setup
│   ├── main.tsx               # Entry point + PWA registration
│   ├── index.css              # Global styles
│   └── vite-env.d.ts          # TypeScript declarations
├── vite.config.ts            # Vite + PWA configuration
├── generate-icons.js         # Icon generation script
├── PWA_SETUP.md             # PWA setup guide
└── package.json
```

## 🎮 How to Use the Timer

1. **Prepare your cube** following the displayed scramble
2. **Hold down** anywhere on the screen (it will turn green)
3. **Release** to start the timer (it will turn red)
4. **Solve the cube** as fast as you can
5. **Tap the screen** when finished (it will turn blue)
6. **Tap again** to reset and get a new scramble

### Session Management
- Click **"New Session"** to create a new session
- Click the **pencil icon** to rename a session
- Click the **trash icon** to delete times or sessions

## 🧭 Routing
- `/` → Timer
- `/sessions` → Sessions list
- `/sessions/:sessionId` → Session detail
- `/statistics` → Global and time-based statistics
- Switch to **"Stats"** view to see all statistics

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server with PWA enabled

# Build
npm run build        # TypeScript + Vite build
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🌐 PWA Features

### Service Worker
- **Precaching** of all static assets
- **Runtime caching** for external fonts (Google Fonts)
- **Cache First strategy** for optimal performance
- **Auto-update** with user notification

### Manifest
- Name: "Rubik's Cube Timer"
- Theme: Yellow (#fde047) - iconic cube color
- Display: Standalone (native app experience)
- Orientation: Portrait (mobile optimized)

### Offline Support
The app works completely offline after the first visit, allowing you to:
- Time your solves
- Save times to sessions
- View statistics
- Generate new scrambles

## 🎯 Key Features Explained

### Scramble Algorithm
The scramble generator creates official WCA-style scrambles:
- 30 random moves
- No consecutive moves on the same face
- No consecutive moves on opposite faces
- Uses standard notation (R, L, U, D, F, B with ', 2 modifiers)

### Timer Precision
- Uses `Date.now()` for accurate timing
- 10ms interval updates for smooth display
- Centisecond precision (0.01s)
- No performance impact on solve times

## 📄 License

This project is open source.

## 👨‍💻 Author

Built with ❤️ and React

---

**Happy cubing! 🎲⏱️**
