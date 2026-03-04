# GardenStation Frontend

Unified web and mobile application for the GardenStation smart-garden platform. A single TypeScript codebase delivers a progressive web app **and** native Android/iOS builds through Ionic's UI components and Capacitor's native bridge.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18 + Ionic 8 |
| Language | TypeScript 5 |
| Build tool | Vite 6 |
| Native runtime | Capacitor 6 (Android & iOS) |
| State management | Zustand |
| HTTP client | Axios (JWT interceptor, auto-refresh) |
| Real-time | socket.io-client |
| Charts | Recharts |
| Native plugins | Push Notifications, Camera, SQLite, Preferences |

## Prerequisites

- **Node.js** >= 20
- **npm** (ships with Node)
- **Ionic CLI** — `npm i -g @ionic/cli`
- **Capacitor CLI** — installed as a dev-dependency, no global install needed
- **Android Studio** (for Android builds) or **Xcode** (for iOS builds)

## Quick Start

```bash
# Install dependencies
cd frontend
npm install

# Run in the browser (hot-reload)
ionic serve

# Run on a connected Android device / emulator
ionic cap run android --livereload --external

# Run on an iOS simulator (macOS only)
ionic cap run ios --livereload --external
```

### Production Build

```bash
npm run build          # TypeScript check + Vite production build
npx cap sync           # Copy web assets into native projects
```

Then open `android/` in Android Studio or `ios/App` in Xcode to create a release build.

## Project Structure

```
frontend/src/
  main.tsx                  App entry point
  App.tsx                   IonApp + router + tab layout
  api/                      Axios client & per-domain service modules
  hooks/                    Custom hooks (WebSocket, sensors, push)
  store/                    Zustand stores (auth, sensors, actuators, settings)
  services/                 Business-logic helpers
  theme/                    Ionic CSS variable overrides
  utils/                    Shared utilities
  components/
    Auth/                   Login & registration
    Dashboard/              Overview cards & charts
    Monitoring/             Live sensor data
    Controls/               Actuator commands
    Plants/                 Plant catalogue
    Harvest/                Harvest queue management
    Settings/               User preferences
    Common/                 Shared UI components
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (Vitest) |
| `npm run cap:sync` | Sync web assets to native projects |
| `npm run cap:android` | Live-reload on Android device |
| `npm run cap:ios` | Live-reload on iOS simulator |

## Documentation

Full architecture docs, API mappings, and development guides live in the project-info repo:

- [Frontend Architecture](../project-info/Docs/06_Software/Frontend/Frontend%20Architecture.md) — stack decisions, component architecture, routing, Mermaid diagrams
- [Mobile App Architecture](../project-info/Docs/06_Software/Frontend/Mobile%20App%20Architecture.md) — Capacitor native layer, plugins, offline strategy
- [Mobile Application](../project-info/Docs/06_Software/Frontend/Mobile%20Application.md) — screen descriptions, UX flows, mockups
- [API Mapping](../project-info/Docs/06_Software/Frontend/API%20Mapping.md) — screen-to-endpoint mapping, WebSocket subscriptions
- [Frontend Dev Guide](../project-info/Docs/07_Development/Frontend/Frontend.md) — environment setup, build & deploy workflow
