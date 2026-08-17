# 🌦️ WeatherCast — Modern Atmospheric Intelligence & Telemetry Dashboard

A next-generation, real-time meteorological intelligence web application built with **React 18**, **TypeScript**, **Three.js**, **Tailwind CSS**, and dynamic atmospheric shaders.

![WeatherCast Preview](public/preview.png) *(or dynamic live dashboard preview)*

---

## ✨ Features

- 🌍 **Interactive 3D Earth Globe**: Explore global atmospheric coordinates and weather patterns with a Three.js interactive globe.
- ⚡ **Real-Time Weather Telemetry**: Accurate meteorological data powered by Open-Meteo & OpenWeather APIs.
- 🎨 **Dynamic Atmosphere Engine**: Shaders and particle simulations adapting live to current weather conditions (rain, snowfall, thunder, mist, clear skies, starry nights).
- 📊 **Interactive Hourly & 7-Day Forecasts**: Recharts-powered telemetry graphs and forecasts with dynamic temperature curves.
- 🧭 **Atmospheric Bento Metrics**:
  - UV Index with safety spectrum
  - Barometric pressure gauge
  - Dynamic Wind Vector & Compass
  - Humidity & Dew Point telemetry
  - Optical Visibility range
  - Sunrise & Sunset Astronomical Arc
  - Air Quality Index (AQI)
- 🔍 **Global Spotlight Search**: Quick keyboard shortcut (`Ctrl+K` / `Cmd+K` or `/`) with live geocoding suggestions.
- 🌓 **Glassmorphic Cyber-Minimalist UI**: Smooth micro-interactions, responsive reactive cards, and high-contrast ambient modes.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **3D Graphics & Shaders**: [Three.js](https://threejs.org/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn` / `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shashankpawar0113/weathercast.git
   cd weathercast
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Copy the `.env.example` file:
   ```bash
   cp .env.example .env
   ```
   *(By default, WeatherCast will automatically fallback to the high-precision Open-Meteo engine with zero API keys required).*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🛡️ Security Architecture

WeatherCast employs a zero-exposure architecture:
- Environment variables containing private API keys are ignored by `.gitignore` and kept off the client.
- Built-in Open-Meteo integration functions without requiring any API keys.
- Serverless API proxies (in `/api`) handle secure upstream requests on serverless hosting platforms like Vercel.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
