# Deepshikha Dey — Developer Portfolio & "Catch That Pip!" 🎮

> **Computer Science (Cyber Security) &bull; Front-End Engineering &bull; Data Science**  
> *Symbiosis Skills and Professional University (SSPU), Pune, India (Graduation 2027)*  
> CGPA: **8.94 / 10.0** &bull; Recent SGPA: **9.45 / 10.0**

A distinctive interactive developer portfolio merging a **Retro OS Desktop (Elaine-style)**, a **Gingham Scrapbook Profile (Daksh/Maryam-style)**, a **Dynamic GitHub Live Sync Projects Archive**, and an authentic **Pokémon &times; Undertale mini-game: "Catch That Pip!"**.

---

## 🚀 Live Demo & Vercel Deployment

This project is built using zero-dependency web standards (pure HTML5, CSS3, and ES6+ JavaScript), making it **100% plug-and-play compatible with Vercel**, GitHub Pages, Netlify, or any static hosting platform.

### Quick Deploy to Vercel

#### Method 1: Import via Vercel Web Dashboard (Recommended)
1. Push this repository to your GitHub account (`https://github.com/DeepshikhaDey28/portfolio`).
2. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
3. Click **"Add New..." &rarr; "Project"**.
4. Select the `portfolio` repository from your GitHub list.
5. Framework Preset: Choose **"Other"** (Vercel automatically detects the static root with `vercel.json`).
6. Click **"Deploy"**. Your live URL will be active in seconds!

#### Method 2: Deploy via Vercel CLI
```bash
# In this directory:
npx vercel
```
Follow the interactive prompts (use default settings for static deployment).

---

## ✨ Features & Architecture

### 1. 🖥️ Retro OS Desktop (`#desktop`)
- Authentic 90s OS interface with top header bar, live system clock, and taskbar.
- **Draggable & Minimizable Windows**: `C:\DEEPSHIKHA\portfolio` and `C:\DEEPSHIKHA\toolbox`.
- **Trainer Quest HUD Bar**: Shows trainer level (LV.28), dynamic quest notifications, and EXP counter (reflecting CGPA 8.94).
- Custom pixel-art SVG badges for Profile, Works, and the Pip Game.
- Integrated Contact and Resume modals with dual-view (Interactive HTML Resume + Official PDF Viewer).

### 2. 📖 Scrapbook Profile & Resume (`#about`)
- Warm red & cream gingham border frame.
- Polaroid avatar card with washi tape decorations and marker badges.
- Technical skills categorised by Front-End, Data Science & Telemetry, and Core CS / Security.
- Academic timeline spanning B.Tech (Cyber Security) at SSPU, Junior College, and Secondary Education.
- Downloadable official PDF resume.

### 3. 📁 Works & GitHub Live Auto-Sync Archive (`#works`)
- **Live GitHub REST API Integration**: Dynamically pulls and renders public repositories from `@DeepshikhaDey28`.
- **Auto-Updates**: Pushing new repositories to GitHub automatically reflects them in the Works archive.
- **Smart LocalStorage Caching**: 15-minute TTL to respect GitHub rate limits while providing instant load times.
- **Interactive App Launchers**: Embedded modal iframe runners for:
  - 🚦 *Smart Traffic Grid & Circuit Simulator* (Autonomous left-lane simulation & racing game)
  - 🛰️ *GlobalPulse Weather Hub* (Real-time telemetry & Chart.js thermal comparison)
  - 🧮 *AuraCalc* (Glassmorphic multi-mode calculator with scientific and financial tools)

### 4. 🎮 "Catch That Pip!" Mini-Game (`#game`)
- **Pokémon-Inspired Battle Mechanics**:
  - 3 wild creature species: **Flamechar** (Fire/Code), **Bulbasprout** (Data/Grass), and **Buggypip** (Glitch/Cyber).
  - Combat command bar: `BATTLE` (code attacks), `COMMUNE` (refactor & inspect), `PIP-BAG` (potions & espresso), `CATCH` (Pip-Capsule).
  - Dynamic HP bars, type system, status badges, and speech balloons.
- **Undertale-Inspired Bullet-Hell Dodging Arena**:
  - Canvas-based obstacle dodging mini-game during enemy attack turns.
  - Player character rendered as Deepshikha's portrait inside an Undertale red soul heart.
  - Arrow Keys, WASD, or on-screen mobile D-pad controls.
  - Unique bullet patterns per species (ember bullets, code brackets, glitch blocks).
- **Royalty-Free 8-Bit Chiptune Synthesizer**:
  - Custom Web Audio API synthesizer generating 16-step retro background music with melody, triangle bass, and noise percussion.
  - Undertale dialogue typewriter voice blips and combat sound effects.

---

## 📂 Project Structure

```text
├── index.html                 # Single Page Application (4 views: desktop, about, works, game)
├── style.css                  # Comprehensive CSS design system (retro OS + gingham scrapbook)
├── app.js                     # Unified logic (audio synth, routing, GitHub sync, Pip game)
├── vercel.json                # Vercel deployment configuration & security headers
├── package.json               # Project manifest
├── local-dev-server.cjs       # Lightweight zero-dependency local Node server
├── .gitignore                 # Clean repository rules
├── assets/                    # Optimized SVGs, user portrait, and PDF resume
│   ├── profile.jpg            # Deepshikha's portrait photo
│   ├── resume.pdf             # Official curriculum vitae
│   ├── pips_logo.svg          # "Catch That Pip!" arcade game logo
│   ├── flamechar_sprite.svg   # Flamechar creature sprite
│   ├── bulbasprout_sprite.svg # Bulbasprout creature sprite
│   ├── buggypip_sprite.svg    # Buggypip creature sprite
│   ├── icon_pip_capsule.svg   # Pip-Capsule icon
│   ├── icon_works_game.svg    # Works bag icon
│   └── icon_profile_trainer.svg# Profile badge icon
└── projects/                  # Standalone interactive web apps
    ├── traffic-sim/           # Traffic grid & circuit racing simulator
    ├── weather-hub/           # GlobalPulse Weather Hub
    └── aura-calc/             # AuraCalc multi-mode calculator
```

---

## 🛠️ Local Development

To run locally without installing any external packages:

```bash
# Clone the repository
git clone https://github.com/DeepshikhaDey28/portfolio.git
cd portfolio

# Run the built-in development server
npm start
# or: node local-dev-server.cjs
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Best Practices

- Content-Security-Policy and X-Frame-Options configured in `vercel.json` to prevent malicious clickjacking while permitting internal modal execution.
- GitHub API calls handle errors gracefully with offline seed fallback repositories when offline or rate-limited.
- Cross-browser support across modern Chromium, Safari, Firefox, and mobile touch devices.

---

## 📬 Contact & Connect

- **GitHub**: [@DeepshikhaDey28](https://github.com/DeepshikhaDey28)
- **LinkedIn**: [Deepshikha Dey](https://www.linkedin.com/in/deepshikha-dey-904a931aa/)
- **Email**: `dey.deepshikha.283@gmail.com`
- **Location**: Pune, Maharashtra, India
