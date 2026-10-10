/**
 * Deepshikha Dey - Portfolio & "Catch That Pip!" Interactive Experience
 * Featuring:
 * - Royalty-Free 8-Bit Chiptune Music Synthesizer & Undertale/Retro Sound Engine
 * - Dynamic Live GitHub API Sync with caching & auto-updates
 * - "Catch That Pip!" creature battle & Undertale canvas dodging mini-game
 * - Project runner iframe modal & scrapbook view navigation
 */

// Guard against server-side Node.js execution
if (typeof window !== 'undefined' && typeof document !== 'undefined') {

// ========================================================
// 1. ROYALTY-FREE 8-BIT CHIPTUNE BGM & AUDIO SYNTHESIZER
// ========================================================
// 1. AUDIO ENGINE & SOUNDTRACK (REAL MP3 AUDIO + SYNTH FALLBACK)
// ========================================================
class RetroAudioEngine {
  constructor() {
    this.sfxEnabled = true;
    this.bgmEnabled = true; // Automatically ON by default
    this.currentView = 'desktop';
    this.lastWalkTime = 0;
    this.isUnlocked = false;

    // Real audio files provided by user in assets/sounds/
    this.audioFiles = {
      websiteBgm: new Audio('assets/sounds/website_bgm.mp3'),
      gameBgm: new Audio('assets/sounds/game_bgm.mp3'),
      click: new Audio('assets/sounds/game_click.mp3'),
      death: new Audio('assets/sounds/game_death.mp3'),
      walkObsidian: new Audio('assets/sounds/walk_obsidian.mp3'),
      walkSwim: new Audio('assets/sounds/walk_swim.mp3'),
      walkGrass: new Audio('assets/sounds/walk_grass.mp3'),
      walkSand: new Audio('assets/sounds/walk_sand.mp3'),
      walkGravel: new Audio('assets/sounds/walk_gravel.mp3')
    };

    try {
      this.audioFiles.websiteBgm.loop = true;
      this.audioFiles.websiteBgm.volume = 0.40;
      this.audioFiles.websiteBgm.preload = 'auto';

      this.audioFiles.gameBgm.loop = true;
      this.audioFiles.gameBgm.volume = 0.45;
      this.audioFiles.gameBgm.preload = 'auto';

      this.audioFiles.click.volume = 0.50;
      this.audioFiles.death.volume = 0.55;

      this.audioFiles.walkObsidian.volume = 0.35;
      this.audioFiles.walkSwim.volume = 0.38;
      this.audioFiles.walkGrass.volume = 0.32;
      this.audioFiles.walkSand.volume = 0.35;
      this.audioFiles.walkGravel.volume = 0.35;
    } catch (e) {}

    // Dynamic Volume Control Levels
    this.masterVolume = 1.0;
    this.bgmVolume = 0.50;
    this.sfxVolume = 0.70;

    // Automatic Background Audio Pause on Phone/Browser Minimize & Screen Lock
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAllBgm();
        } else {
          if (this.bgmEnabled && this.isUnlocked) {
            this.setBgmForView(this.currentView);
          }
        }
      });
      window.addEventListener('pagehide', () => {
        this.pauseAllBgm();
      });
    }

    // Web Audio synthesizer for chiptune & retro backup
    this.audioCtx = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bgmMasterGain = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
        this.bgmMasterGain = this.audioCtx.createGain();
        this.bgmMasterGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        this.bgmMasterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play a simple synthesized note
  playTone(freq, type = 'square', duration = 0.08, gainVal = 0.08, ramp = true) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      if (ramp) {
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      }

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  // Voice typewriter blip
  playBlip() {
    if (!this.sfxEnabled) return;
    this.playTone(240 + Math.random() * 80, 'square', 0.04, 0.04);
  }

  // Real click sound
  playClick() {
    if (!this.sfxEnabled) return;
    try {
      this.audioFiles.click.currentTime = 0;
      this.audioFiles.click.play().catch(() => {
        this.playTone(520, 'triangle', 0.06, 0.08);
      });
    } catch (e) {
      this.playTone(520, 'triangle', 0.06, 0.08);
    }
  }

  playSelect() {
    this.playClick();
  }

  // Real walking footstep sounds per surface type
  playWalk(surface = 'gravel') {
    if (!this.sfxEnabled) return;
    const now = Date.now();
    if (now - this.lastWalkTime < 220) return; // Throttled footstep cadence
    this.lastWalkTime = now;

    let audio = this.audioFiles.walkGravel;
    if (surface === 'obsidian') audio = this.audioFiles.walkObsidian;
    else if (surface === 'water' || surface === 'swim') audio = this.audioFiles.walkSwim;
    else if (surface === 'grass') audio = this.audioFiles.walkGrass;
    else if (surface === 'sand') audio = this.audioFiles.walkSand;
    else if (surface === 'gravel') audio = this.audioFiles.walkGravel;

    try {
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    } catch (e) {}
  }

  // Battle encounter fanfare
  playEncounter() {
    if (!this.sfxEnabled) return;
    const notes = [330, 392, 494, 587, 659, 784, 880, 988, 1175];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'square', 0.08, 0.07), idx * 55);
    });
  }

  // Attack hit sound
  playAttack() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch (e) {}
  }

  // Hurt / death sound
  playHurt() {
    if (!this.sfxEnabled) return;
    try {
      this.audioFiles.death.currentTime = 0;
      this.audioFiles.death.play().catch(() => {});
    } catch (e) {}
  }

  // Healing chime (Nurse Joy / Coffee Machine restoration)
  playHeal() {
    if (!this.sfxEnabled) return;
    const notes = [493.88, 659.25, 830.61, 987.77, 880.00, 987.77];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.22, 0.10), idx * 110);
    });
  }

  // Item pickup chime
  playItemChime() {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.12, 0.09), idx * 80);
    });
  }

  // Pip-Capsule wobble sound
  playCapsuleWobble() {
    this.playTone(300, 'triangle', 0.1, 0.09);
    setTimeout(() => this.playTone(450, 'triangle', 0.1, 0.09), 100);
  }

  // Victory Fanfare
  playVictory() {
    if (!this.sfxEnabled) return;
    const melody = [
      { f: 523.25, d: 120 },
      { f: 659.25, d: 120 },
      { f: 783.99, d: 120 },
      { f: 1046.50, d: 240 },
      { f: 880.00, d: 140 },
      { f: 1046.50, d: 450 }
    ];
    let time = 0;
    melody.forEach(n => {
      setTimeout(() => this.playTone(n.f, 'square', n.d / 1000, 0.1), time);
      time += n.d;
    });
  }

  // Volume & Audio Channel Controls
  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    this.updateAllVolumes();
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    this.updateAllVolumes();
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.updateAllVolumes();
  }

  toggleBgm(enabled) {
    if (enabled !== undefined) this.bgmEnabled = !!enabled;
    else this.bgmEnabled = !this.bgmEnabled;
    this.updateAllVolumes();
    if (!this.bgmEnabled) {
      this.stopAllBgm();
    } else {
      this.setBgmForView(this.currentView);
    }
    return this.bgmEnabled;
  }

  toggleSfx(enabled) {
    if (enabled !== undefined) this.sfxEnabled = !!enabled;
    else this.sfxEnabled = !this.sfxEnabled;
    this.updateAllVolumes();
    return this.sfxEnabled;
  }

  updateAllVolumes() {
    const bgmEffective = this.bgmEnabled ? (this.bgmVolume * this.masterVolume) : 0;
    const sfxEffective = this.sfxEnabled ? (this.sfxVolume * this.masterVolume) : 0;

    try {
      this.audioFiles.websiteBgm.volume = Math.max(0, Math.min(1, bgmEffective * 0.75));
      this.audioFiles.gameBgm.volume = Math.max(0, Math.min(1, bgmEffective * 0.85));

      this.audioFiles.click.volume = Math.max(0, Math.min(1, sfxEffective * 0.7));
      this.audioFiles.death.volume = Math.max(0, Math.min(1, sfxEffective * 0.8));

      this.audioFiles.walkObsidian.volume = Math.max(0, Math.min(1, sfxEffective * 0.5));
      this.audioFiles.walkSwim.volume = Math.max(0, Math.min(1, sfxEffective * 0.6));
      this.audioFiles.walkGrass.volume = Math.max(0, Math.min(1, sfxEffective * 0.5));
      this.audioFiles.walkSand.volume = Math.max(0, Math.min(1, sfxEffective * 0.5));
      this.audioFiles.walkGravel.volume = Math.max(0, Math.min(1, sfxEffective * 0.5));
    } catch (e) {}

    if (this.bgmMasterGain && this.audioCtx) {
      try {
        this.bgmMasterGain.gain.setValueAtTime(bgmEffective * 0.15, this.audioCtx.currentTime);
      } catch (e) {}
    }
  }

  // View-based dynamic background music manager
  setBgmForView(view) {
    this.currentView = view;
    if (!this.bgmEnabled) {
      this.stopAllBgm();
      this.syncUi(false);
      return;
    }

    if (view === 'game') {
      // STRICT GAME PAGE AUDIO ISOLATION:
      // Completely silence, pause, and reset website ambient music
      try {
        this.audioFiles.websiteBgm.pause();
        this.audioFiles.websiteBgm.currentTime = 0;
      } catch (e) {}

      // Play ONLY game background music
      try {
        if (this.audioFiles.gameBgm.paused) {
          const p = this.audioFiles.gameBgm.play();
          if (p !== undefined) {
            p.then(() => {
              this.isUnlocked = true;
              this.syncUi(true);
            }).catch(() => {
              this.isUnlocked = false;
              this.syncUi(true);
            });
          }
        } else {
          this.syncUi(true);
        }
      } catch (e) {}
    } else {
      // NON-GAME PAGES (Desktop, About, Works):
      // Completely silence, pause, and reset game music
      try {
        this.audioFiles.gameBgm.pause();
        this.audioFiles.gameBgm.currentTime = 0;
      } catch (e) {}

      // Play ONLY website ambient background music
      try {
        if (this.audioFiles.websiteBgm.paused) {
          const p = this.audioFiles.websiteBgm.play();
          if (p !== undefined) {
            p.then(() => {
              this.isUnlocked = true;
              this.syncUi(true);
            }).catch(() => {
              this.isUnlocked = false;
              this.syncUi(true);
            });
          }
        } else {
          this.syncUi(true);
        }
      } catch (e) {}
    }
  }

  pauseAllBgm() {
    try {
      this.audioFiles.websiteBgm.pause();
      this.audioFiles.gameBgm.pause();
    } catch (e) {}
    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend().catch(() => {});
    }
  }

  stopAllBgm() {
    try {
      this.audioFiles.websiteBgm.pause();
      this.audioFiles.websiteBgm.currentTime = 0;
      this.audioFiles.gameBgm.pause();
      this.audioFiles.gameBgm.currentTime = 0;
    } catch (e) {}
  }

  syncUi(isPlaying) {
    const musicBtn = document.getElementById('music-toggle-btn');
    const musicIcon = document.getElementById('music-icon');
    if (musicBtn && musicIcon) {
      musicBtn.classList.toggle('active', isPlaying);
      musicBtn.classList.toggle('muted', !isPlaying);
      musicBtn.title = isPlaying ? 'Audio is ON (Click for Silent)' : 'Audio is SILENT (Click to Play)';
      musicIcon.innerHTML = isPlaying ? `
        <svg class="audio-svg playing-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>` : `
        <svg class="audio-svg muted-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>`;
    }

    const gameAudioIcon = document.getElementById('game-audio-icon');
    if (gameAudioIcon) {
      gameAudioIcon.textContent = isPlaying ? '🎵 Audio: ON' : '🔇 Audio: OFF';
    }
    const gameAudioBtn = document.getElementById('game-audio-toggle-btn');
    if (gameAudioBtn) {
      gameAudioBtn.classList.toggle('active', isPlaying);
    }

    const enbAudioBtn = document.getElementById('enb-audio-btn');
    if (enbAudioBtn) {
      enbAudioBtn.classList.toggle('active', isPlaying);
      enbAudioBtn.classList.toggle('muted', !isPlaying);
      enbAudioBtn.title = isPlaying ? 'Soundtrack is ON (Click to Mute)' : 'Soundtrack is MUTED (Click to Play)';
      const label = enbAudioBtn.querySelector('.enb-audio-label');
      if (label) {
        label.textContent = isPlaying ? 'Sound' : 'Muted';
      }
    }
  }
}

const sfx = new RetroAudioEngine();


// ========================================================
// 2. VIEW NAVIGATION & ROUTING (#desktop, #about, #works, #game)
// ========================================================
const desktopView = document.getElementById('desktop-view');
const aboutView = document.getElementById('about-view');
const worksView = document.getElementById('works-view');
const gameView = document.getElementById('game-view');

const views = {
  desktop: desktopView,
  about: aboutView,
  works: worksView,
  game: gameView
};

function switchView(targetViewId, pushHash = true) {
  sfx.playClick();
  Object.keys(views).forEach(vKey => {
    const el = views[vKey];
    if (el) el.classList.remove('active');
  });

  const activeEl = views[targetViewId] || desktopView;
  activeEl.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pushHash) {
    history.pushState({ view: targetViewId }, '', `#${targetViewId}`);
  }

  // Trigger game start or sync when entering specific views
  if (targetViewId === 'game') {
    pipGame.onEnter();
  } else {
    pipGame.onLeave();
  }
  sfx.setBgmForView(targetViewId);

  if (targetViewId === 'works') {
    loadGitHubRepos();
  }
}

// Navigation Triggers
document.getElementById('view-about-top-btn')?.addEventListener('click', () => switchView('about'));
document.getElementById('quick-about-btn')?.addEventListener('click', () => switchView('about'));
document.getElementById('icon-profile')?.addEventListener('click', () => switchView('about'));
document.getElementById('win-about-open-btn')?.addEventListener('click', () => switchView('about'));
document.getElementById('works-to-about-btn')?.addEventListener('click', () => switchView('about'));
document.getElementById('game-to-about-btn')?.addEventListener('click', () => switchView('about'));

document.getElementById('quick-works-btn')?.addEventListener('click', () => switchView('works'));
document.getElementById('icon-works')?.addEventListener('click', () => switchView('works'));
document.getElementById('win-quick-works-btn')?.addEventListener('click', () => switchView('works'));
document.getElementById('about-to-works-btn')?.addEventListener('click', () => switchView('works'));
document.getElementById('game-to-works-btn')?.addEventListener('click', () => switchView('works'));

document.getElementById('quick-game-btn')?.addEventListener('click', () => switchView('game'));
document.getElementById('icon-game')?.addEventListener('click', () => switchView('game'));
document.getElementById('works-to-game-btn')?.addEventListener('click', () => switchView('game'));
document.getElementById('about-to-game-btn')?.addEventListener('click', () => switchView('game'));

document.getElementById('back-to-desktop-btn')?.addEventListener('click', () => switchView('desktop'));
document.getElementById('bottom-back-btn')?.addEventListener('click', () => switchView('desktop'));
document.getElementById('works-back-to-desktop-btn')?.addEventListener('click', () => switchView('desktop'));
document.getElementById('works-bottom-back-btn')?.addEventListener('click', () => switchView('desktop'));
document.getElementById('game-back-to-desktop-btn')?.addEventListener('click', () => switchView('desktop'));

// Editorial Landing Page Triggers (Image 1 Reference)
document.getElementById('enb-home-btn')?.addEventListener('click', () => switchView('desktop'));
document.getElementById('enb-link-bio')?.addEventListener('click', () => switchView('about'));
document.getElementById('ehc-thumb-bio')?.addEventListener('click', () => switchView('about'));
document.getElementById('ehc-badge-pill')?.addEventListener('click', () => switchView('about'));

document.getElementById('enb-link-projects')?.addEventListener('click', () => switchView('works'));
document.getElementById('epc-btn-projects')?.addEventListener('click', () => switchView('works'));
document.getElementById('emg-card-all')?.addEventListener('click', () => switchView('works'));

document.getElementById('enb-link-game')?.addEventListener('click', () => switchView('game'));
document.getElementById('epc-btn-game')?.addEventListener('click', () => switchView('game'));

// Browser popstate handler
window.addEventListener('popstate', () => {
  const hash = location.hash.replace('#', '') || 'desktop';
  switchView(hash, false);
});

// Initial hash inspection on boot & background music auto-start
const initialHash = location.hash.replace('#', '') || 'desktop';
if (['about', 'works', 'game'].includes(initialHash)) {
  switchView(initialHash, false);
} else {
  sfx.setBgmForView('desktop');
}

// User-gesture audio unlocker for modern browsers autoplay policies
const unlockAudioOnGesture = () => {
  sfx.init();
  if (sfx.bgmEnabled) {
    sfx.setBgmForView(sfx.currentView);
  }
  ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => {
    window.removeEventListener(evt, unlockAudioOnGesture);
  });
};
['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => {
  window.addEventListener(evt, unlockAudioOnGesture, { once: true, passive: true });
});


// ========================================================
// 3. TOAST NOTIFICATIONS & AUDIO TOGGLES
// ========================================================
const toast = document.getElementById('toast-notification');
let toastTimer = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// Silent mode toggle (Modern audio button)
function handleSilentToggle() {
  const isPlaying = sfx.toggleBgm();
  showToast(isPlaying ? 'Soundtrack Playing 🎶' : 'Silent Mode (Muted) 🔇');
}

document.getElementById('music-toggle-btn')?.addEventListener('click', handleSilentToggle);
document.getElementById('game-audio-toggle-btn')?.addEventListener('click', handleSilentToggle);
document.getElementById('enb-audio-btn')?.addEventListener('click', handleSilentToggle);
document.getElementById('ehc-music-toggle')?.addEventListener('click', handleSilentToggle);


// ========================================================
// 4. LIVE GITHUB AUTO-SYNC & REPOSITORIES CATALOG
// ========================================================
const GITHUB_USERNAME = 'DeepshikhaDey28';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`;
const REPOS_CACHE_KEY = 'deepshikha_github_repos_v2';

const langColors = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  TypeScript: '#3178c6',
  C: '#555555',
  Default: '#64748b'
};

const WORKING_REPOS_MAP = {
  'smart_traffic_simulation': {
    url: 'projects/traffic-grid-simulation/index.html',
    title: 'smart_traffic_simulation',
    desc: 'Autonomous traffic grid simulator with 4-phase signal timing, emergency vehicle corridors & circuit racer.',
    tag: 'SIMULATION & ALGORITHMS',
    lang: 'JavaScript'
  },
  'weatherwhether': {
    url: 'projects/weather-telemetry-hub/index.html',
    title: 'weatherwhether',
    desc: 'Real-time meteorological telemetry & atmospheric condition monitoring dashboard across Indian & German stations.',
    tag: 'LIVE TELEMETRY',
    lang: 'JavaScript / API'
  },
  'deep_thoughts_app_for_notes': {
    url: 'projects/deep_thoughts_app_for_notes/index.html',
    title: 'deep_thoughts_app_for_notes',
    desc: 'Interactive responsive Markdown notes & creative journaling application with live preview and local persistence.',
    tag: 'PRODUCTIVITY APP',
    lang: 'HTML / CSS / JS'
  },
  'First_Python': {
    url: 'projects/First_Python/index.html',
    title: 'First_Python',
    desc: 'Interactive Python 3 computational algorithm runner & variable scope explorer with live terminal console.',
    tag: 'PYTHON ALGORITHMS',
    lang: 'Python'
  },
  'B2B-bussiness-website-': {
    url: 'projects/B2B-bussiness-website-/index.html',
    title: 'B2B-bussiness-website-',
    desc: 'Front-end multi-category commercial wholesale & retail storefront catalog template with interactive shopping cart.',
    tag: 'COMMERCE UI',
    lang: 'HTML / CSS'
  },
  'auracalc-suite': {
    url: 'projects/auracalc-suite/index.html',
    title: 'auracalc-suite',
    desc: 'Precision algorithmic calculator suite with standard, scientific, unit conversion, and financial splitters.',
    tag: 'MATH UTILITY',
    lang: 'JavaScript'
  }
};

function renderFeaturedProjects(repos) {
  const container = document.getElementById('featured-projects-grid');
  if (!container) return;

  // Filter for projects with a working interactive app, excluding the portfolio itself
  const workingProjects = repos
    .filter(r => r.name !== 'portfolio' && WORKING_REPOS_MAP[r.name])
    .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
    .slice(0, 5);

  if (workingProjects.length === 0) return;

  container.innerHTML = '';
  workingProjects.forEach(repo => {
    const app = WORKING_REPOS_MAP[repo.name];
    const card = document.createElement('div');
    card.className = 'emg-card run-project-btn';
    card.setAttribute('data-url', app.url);
    card.setAttribute('data-title', repo.name);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('title', `Click to launch ${repo.name} in in-app popup window`);

    card.innerHTML = `
      <div class="emg-card-header">
        <span class="emg-card-tag">${app.tag}</span>
        <span class="emg-popup-hint">⤢ In-App</span>
      </div>
      <h4 class="emg-card-title">${repo.name}</h4>
      <p class="emg-card-desc">${app.desc}</p>
    `;
    container.appendChild(card);
  });
}

async function fetchGitHubRepos(forceRefresh = false) {
  const statusBadge = document.getElementById('github-sync-status-badge');
  const countBadge = document.getElementById('works-count-badge');
  const refreshIcon = document.getElementById('gh-refresh-icon');

  if (refreshIcon) refreshIcon.classList.add('spin-anim');
  if (statusBadge) {
    statusBadge.textContent = '⟳ Syncing...';
    statusBadge.className = 'sync-badge syncing';
  }

  // Check LocalStorage cache first unless force refresh requested
  if (!forceRefresh) {
    const cached = localStorage.getItem(REPOS_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 1000 * 60 * 15 && parsed.data?.length) {
          renderRepos(parsed.data);
          updateSyncUI(parsed.data.length, 'Live Cache');
          return;
        }
      } catch (e) {}
    }
  }

  try {
    const res = await fetch(GITHUB_API_URL, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (!res.ok) throw new Error(`GitHub API HTTP ${res.status}`);
    const repos = await res.json();

    if (Array.isArray(repos) && repos.length > 0) {
      localStorage.setItem(REPOS_CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: repos
      }));
      renderRepos(repos);
      updateSyncUI(repos.length, 'Live Synced');
      showToast(`Synced ${repos.length} GitHub repositories!`);
    } else {
      throw new Error('No repositories found');
    }
  } catch (err) {
    console.warn('GitHub fetch error, checking fallback cache:', err);
    const cached = localStorage.getItem(REPOS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      renderRepos(parsed.data);
      updateSyncUI(parsed.data.length, 'Offline Cache');
    } else {
      // Fallback seed repositories based on user's GitHub sorted newest first
      const fallbackRepos = [
        {
          name: 'portfolio',
          html_url: 'https://github.com/DeepshikhaDey28/portfolio',
          description: 'Developer portfolio & retro OS workspace featuring live GitHub sync and Catch That Pip Pokémon-style game.',
          language: 'HTML',
          stargazers_count: 2,
          forks_count: 0,
          updated_at: '2026-10-10T18:51:13Z'
        },
        {
          name: 'smart_traffic_simulation',
          html_url: 'https://github.com/DeepshikhaDey28/smart_traffic_simulation',
          description: 'Autonomous traffic grid simulator with 4-phase signal timing, emergency vehicle corridors & circuit racer.',
          language: 'JavaScript',
          stargazers_count: 1,
          forks_count: 0,
          updated_at: '2026-10-06T15:43:46Z'
        },
        {
          name: 'weatherwhether',
          html_url: 'https://github.com/DeepshikhaDey28/weatherwhether',
          description: 'Real-time meteorological telemetry & atmospheric condition monitoring dashboard across Indian & German stations.',
          language: 'JavaScript',
          stargazers_count: 1,
          forks_count: 0,
          updated_at: '2026-09-29T11:56:15Z'
        },
        {
          name: 'deep_thoughts_app_for_notes',
          html_url: 'https://github.com/DeepshikhaDey28/deep_thoughts_app_for_notes',
          description: 'Interactive responsive Markdown notes & creative journaling application with instant live rendering.',
          language: 'HTML',
          stargazers_count: 1,
          forks_count: 0,
          updated_at: '2026-09-28T12:35:04Z'
        },
        {
          name: 'First_Python',
          html_url: 'https://github.com/DeepshikhaDey28/First_Python',
          description: 'Core computational and algorithmic hub in Python covering data structures, scope, and algorithmic efficiency.',
          language: 'Python',
          stargazers_count: 0,
          forks_count: 0,
          updated_at: '2026-08-25T14:41:50Z'
        },
        {
          name: 'B2B-bussiness-website-',
          html_url: 'https://github.com/DeepshikhaDey28/B2B-bussiness-website-',
          description: 'Commercial front-end multi-product wholesale & retail storefront catalog template with shopping cart.',
          language: 'HTML',
          stargazers_count: 1,
          forks_count: 0,
          updated_at: '2026-06-01T11:49:57Z'
        }
      ];
      renderRepos(fallbackRepos);
      updateSyncUI(fallbackRepos.length, 'Verified Seed');
    }
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('spin-anim');
  }
}

function updateSyncUI(count, statusText) {
  const statusBadge = document.getElementById('github-sync-status-badge');
  const countBadge = document.getElementById('works-count-badge');
  if (statusBadge) {
    statusBadge.textContent = `● ${statusText} (${count} Repos)`;
    statusBadge.className = 'sync-badge live';
  }
  if (countBadge) {
    countBadge.textContent = `${count} Live Repositories`;
  }
}

function renderRepos(repos) {
  // Sync the Featured Projects window with the newest projects
  renderFeaturedProjects(repos);

  const container = document.getElementById('github-repos-container');
  if (!container) return;

  container.innerHTML = '';
  repos.forEach(repo => {
    const card = document.createElement('article');
    card.className = 'repo-card';
    card.setAttribute('data-category', 'github ' + (repo.language ? repo.language.toLowerCase() : ''));

    const workingApp = WORKING_REPOS_MAP[repo.name];
    if (workingApp) {
      card.classList.add('run-project-btn');
      card.setAttribute('data-url', workingApp.url);
      card.setAttribute('data-title', repo.name);
      card.style.cursor = 'pointer';
      card.setAttribute('title', `Click to launch ${repo.name} in in-app popup window`);
    }

    const lang = repo.language || 'Code';
    const langColor = langColors[lang] || langColors.Default;
    const desc = (workingApp && workingApp.desc) ? workingApp.desc : (repo.description || 'Public repository under @DeepshikhaDey28.');

    const liveBadgeHtml = workingApp
      ? `<span class="repo-live-tag" title="Interactive application runnable in popup window">● RUNNABLE</span>`
      : '';

    const actionsHtml = workingApp
      ? `
        <div class="repo-action-group">
          <button class="repo-action-btn live-preview-btn run-project-btn" data-url="${workingApp.url}" data-title="${repo.name}" title="Open working project in popup window">
            <span>▶ Live Preview</span>
          </button>
          <a href="${repo.html_url}" target="_blank" class="repo-action-btn code-link-btn" title="View repository source code on GitHub">
            <span>GitHub</span>
          </a>
        </div>
      `
      : `
        <a href="${repo.html_url}" target="_blank" class="repo-action-btn" title="View repository source code on GitHub">
          <span>View Code</span>
        </a>
      `;

    card.innerHTML = `
      <div>
        <div class="repo-top">
          <a href="${repo.html_url}" target="_blank" class="repo-name-link" title="Open repository on GitHub">
            <span>🐙</span> ${repo.name}
          </a>
          <div class="repo-top-badges">
            ${liveBadgeHtml}
            <span class="repo-badge">${lang}</span>
          </div>
        </div>
        <p class="repo-desc">${desc}</p>
      </div>
      <div class="repo-footer">
        <div class="repo-meta-left">
          <span><span class="repo-lang-dot" style="background-color: ${langColor};"></span>${lang}</span>
          <span class="repo-stars">★ ${repo.stargazers_count || 0}</span>
          <span class="repo-forks">⑂ ${repo.forks_count || 0}</span>
        </div>
        ${actionsHtml}
      </div>
    `;
    container.appendChild(card);
  });
}

function loadGitHubRepos() {
  fetchGitHubRepos(false);
}

document.getElementById('refresh-github-btn')?.addEventListener('click', () => {
  sfx.playClick();
  fetchGitHubRepos(true);
});


// Category Filter Tabs (Handles both curated showcase cards and dynamic repo cards)
const filterButtons = document.querySelectorAll('.filter-tab-btn');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sfx.playClick();
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');
    const showcaseCards = document.querySelectorAll('.project-showcase-card');
    const ghSyncPanel = document.getElementById('github-sync-panel');
    const repoCards = document.querySelectorAll('.repo-card');

    if (filter === 'all') {
      showcaseCards.forEach(c => c.style.display = 'flex');
      if (ghSyncPanel) ghSyncPanel.style.display = 'block';
      repoCards.forEach(c => c.style.display = 'flex');
    } else if (filter === 'github') {
      showcaseCards.forEach(c => c.style.display = 'none');
      if (ghSyncPanel) ghSyncPanel.style.display = 'block';
      repoCards.forEach(c => c.style.display = 'flex');
    } else {
      if (ghSyncPanel) ghSyncPanel.style.display = filter === 'data' || filter === 'frontend' ? 'block' : 'none';
      showcaseCards.forEach(c => {
        const cat = c.getAttribute('data-category') || '';
        c.style.display = cat.includes(filter) ? 'flex' : 'none';
      });
      repoCards.forEach(c => {
        const cat = c.getAttribute('data-category') || '';
        c.style.display = cat.includes(filter) ? 'flex' : 'none';
      });
    }
  });
});


// ========================================================
// 5. PROJECT RUNNER MODAL (Interactive In-App Popup Window)
// ========================================================
const runnerModal = document.getElementById('project-runner-modal');
const runnerIframe = document.getElementById('runner-iframe');
const runnerTitle = document.getElementById('runner-modal-title');
const runnerExternalLink = document.getElementById('runner-external-link');

function launchProjectApp(url, title) {
  sfx.playSelect();
  if (runnerTitle) {
    runnerTitle.innerHTML = `
      <span class="runner-dot"></span>
      <span class="runner-repo-name">${title}</span>
      <span class="runner-live-badge">IN-APP PREVIEW</span>
    `;
  }
  if (runnerExternalLink) {
    runnerExternalLink.href = url;
    runnerExternalLink.title = `Open ${title} in a full browser tab`;
  }
  if (runnerIframe) runnerIframe.src = url;
  if (runnerModal) {
    runnerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeProjectRunner() {
  sfx.playClick();
  if (runnerModal) runnerModal.classList.remove('active');
  if (runnerIframe) runnerIframe.src = '';
  document.body.style.overflow = '';
}

// Global Event Delegation for all .run-project-btn and runner controls
document.addEventListener('click', (e) => {
  // Respect explicit external or full tab links
  if (e.target.closest('a[target="_blank"]')) return;

  // View All Projects button in Featured Projects window
  const viewAllBtn = e.target.closest('#emg-view-all-btn, #emg-card-all');
  if (viewAllBtn) {
    e.preventDefault();
    sfx.playClick();
    switchView('works');
    return;
  }

  // Any button or card with .run-project-btn
  const runBtn = e.target.closest('.run-project-btn');
  if (runBtn) {
    e.preventDefault();
    const url = runBtn.getAttribute('data-url');
    const title = runBtn.getAttribute('data-title') || 'Interactive App';
    if (url) launchProjectApp(url, title);
    return;
  }

  const closeBtn = e.target.closest('.close-runner-btn');
  if (closeBtn) {
    e.preventDefault();
    closeProjectRunner();
    return;
  }

  // Click outside popup window (backdrop overlay click)
  if (runnerModal && runnerModal.classList.contains('active') && e.target === runnerModal) {
    closeProjectRunner();
  }
});

// Close popup on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && runnerModal && runnerModal.classList.contains('active')) {
    e.stopPropagation();
    closeProjectRunner();
  }
});


// ========================================================
// 6. "CATCH THAT PIP!" GAME & UNDERTALE DODGING ENGINE
// ========================================================
// ========================================================
// 6. POKEMON-STYLE 2D OPEN WORLD RPG & BATTLE ENGINE
// ========================================================
class CatchThatPipGame {
  constructor() {
    this.mode = 'overworld'; // 'overworld' | 'battle' | 'dex'
    this.owCanvas = null;
    this.owCtx = null;
    this.owAnimId = null;

    this.dodgeCanvas = null;
    this.dodgeCtx = null;
    this.dodgeAnimId = null;

    this.keys = {};
    this.dialogueActive = false;

    // Trainer Player State
    this.player = {
      name: 'DEEPSHIKHA',
      level: 28,
      hp: 100,
      maxHp: 100,
      exp: 89.4,
      // Open World Grid Position (Tile 32x32)
      x: 11 * 32,
      y: 8 * 32,
      w: 24,
      h: 28,
      speed: 2.6,
      sprintSpeed: 4.8,
      dir: 0, // 0: Down, 1: Up, 2: Left, 3: Right
      animFrame: 0,
      animTimer: 0,
      isMoving: false,
      isSprinting: false,
      stepCount: 0,
      dustParticles: [],
      grassParticles: [],
      grassTravel: 0
    };

    // Encounter and Step Progression State
    this.graceSteps = 0; // Cooldown steps after battle so encounters are not annoying
    this.grassStepCount = 0; // 5% step 1 ... 100% step 20
    this.dialogueTimer = null;
    this.currentDialogueText = '';
    this.currentDialogueCb = null;

    // Camera
    this.camera = { x: 0, y: 0, width: 640, height: 360 };

    // Inventory
    this.inventory = {
      capsules: 5,
      potions: 3,
      elixirs: 1,
      candies: 1
    };

    // Pip-Dex Caught Registry (Classic 150 Reference Species)
    this.dex = {
      flamechar: true,
      bulbasprout: true,
      aquabyte: true,
      sparkpip: true,
      jigglypip: false,
      buggypip: false,
      spectrepip: false,
      voltasync: false,
      snorlaxpip: false,
      neuropip: false
    };

    // HeartGold Team & Following Partner State
    this.activePokemonKey = 'flamechar';
    this.playerTeam = ['flamechar', 'bulbasprout', 'aquabyte', 'sparkpip'];
    this.partner = {
      x: 8 * 32,
      y: 7 * 32 + 24,
      dir: 0,
      animFrame: 0
    };

    // HGSS Autumn Leaf & Breeze Particles
    this.windLeaves = [];
    for (let i = 0; i < 20; i++) {
      this.windLeaves.push({
        x: Math.random() * 640,
        y: Math.random() * 360,
        speedX: 0.9 + Math.random() * 1.6,
        speedY: 0.4 + Math.random() * 0.8,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: 0.03 + Math.random() * 0.05,
        size: 3.5 + Math.random() * 2.5,
        color: Math.random() > 0.5 ? '#f59e0b' : '#f97316'
      });
    }

    // Species Catalog referencing original 150 Pokémon
    this.speciesData = {
      flamechar: {
        id: '#004',
        name: 'FLAMECHAR',
        level: 28,
        hp: 85,
        maxHp: 85,
        type1: 'FIRE',
        type2: 'DRAGON',
        badgeClass: 'type-fire',
        spriteSrc: 'assets/flamechar_sprite.svg',
        zone: 'Route 1: Python Meadow',
        greeting: 'Wild FLAMECHAR sparks with enthusiasm! Its tail flame crackles with burning passion!',
        inspect: 'FLAMECHAR (#004 Charmander/Cyndaquil ref): Fire Pip! Known for scorching blaze attacks and loyalty.',
        bulletType: 'fire',
        moves: [
          { name: 'Flamethrower', type: 'FIRE', dmg: 45, desc: 'Blazing torrent of scorching fire' },
          { name: 'Fire Spin', type: 'FIRE', dmg: 35, desc: 'Spiraling fiery vortex trap' },
          { name: 'Dragon Breath', type: 'DRAGON', dmg: 48, desc: 'Furious breath of draconic energy' },
          { name: 'Slash', type: 'NORMAL', dmg: 32, desc: 'High-critical razor claw swipe' }
        ]
      },
      bulbasprout: {
        id: '#001',
        name: 'BULBASPROUT',
        level: 28,
        hp: 90,
        maxHp: 90,
        type1: 'GRASS',
        type2: 'POISON',
        badgeClass: 'type-trainer',
        spriteSrc: 'assets/bulbasprout_sprite.svg',
        zone: 'Route 1: Python Meadow',
        greeting: 'Wild BULBASPROUT emerged with fresh blooming petals and ancient forest energy!',
        inspect: 'BULBASPROUT (#001 Bulbasaur ref): Grass Saurian Pip! Rapidly channels raw solar power.',
        bulletType: 'data',
        moves: [
          { name: 'Vine Whip', type: 'GRASS', dmg: 35, desc: 'Slender graceful vines whip the foe' },
          { name: 'Razor Leaf', type: 'GRASS', dmg: 45, desc: 'Sharp whirlwind of cutting leaves' },
          { name: 'Solar Beam', type: 'GRASS', dmg: 60, desc: 'Concentrated solar energy blast' },
          { name: 'Seed Bomb', type: 'GRASS', dmg: 40, desc: 'Explosive hard seed bombardment' }
        ]
      },
      aquabyte: {
        id: '#007',
        name: 'AQUABYTE',
        level: 28,
        hp: 92,
        maxHp: 92,
        type1: 'WATER',
        type2: 'STEEL',
        badgeClass: 'type-code',
        spriteSrc: 'assets/aquabyte_sprite.svg',
        zone: 'Route 2: Data Lake',
        greeting: 'Wild AQUABYTE surfaced from the lake! Its hardened shell glistens with crystal water!',
        inspect: 'AQUABYTE (#007 Squirtle ref): Water Turtle Pip! Reinforced carapace deflects all heavy blows.',
        bulletType: 'data',
        moves: [
          { name: 'Water Gun', type: 'WATER', dmg: 35, desc: 'Pressurized jet of swift water' },
          { name: 'Hydro Pump', type: 'WATER', dmg: 60, desc: 'Massive blast of tidal water cannon' },
          { name: 'Bubble Beam', type: 'WATER', dmg: 40, desc: 'Forceful spray of iridescent bubbles' },
          { name: 'Aqua Tail', type: 'WATER', dmg: 46, desc: 'Wave-crested crashing tail smash' }
        ]
      },
      sparkpip: {
        id: '#025',
        name: 'SPARKPIP',
        level: 28,
        hp: 82,
        maxHp: 82,
        type1: 'ELECTRIC',
        type2: 'SPEED',
        badgeClass: 'type-fire',
        spriteSrc: 'assets/sparkpip_sprite.svg',
        zone: 'Route 1: Python Meadow',
        greeting: 'Wild SPARKPIP crackles with high-voltage speed! "Pika-pip!"',
        inspect: 'SPARKPIP (#025 Pikachu ref): Electric Mouse Pip! Generates pure lightning from rosy cheeks.',
        bulletType: 'fire',
        moves: [
          { name: 'Thunderbolt', type: 'ELECTRIC', dmg: 50, desc: 'Fierce bolt of lightning from heaven' },
          { name: 'Volt Tackle', type: 'ELECTRIC', dmg: 60, desc: 'Electrified high-speed tackle' },
          { name: 'Thunder Wave', type: 'ELECTRIC', dmg: 25, desc: 'Paralyzing arc of pure voltage' },
          { name: 'Iron Tail', type: 'STEEL', dmg: 40, desc: 'Hardened metallic tail strike' }
        ]
      },
      jigglypip: {
        id: '#039',
        name: 'JIGGLYPIP',
        level: 28,
        hp: 110,
        maxHp: 110,
        type1: 'FAIRY',
        type2: 'SOUND',
        badgeClass: 'type-trainer',
        spriteSrc: 'assets/jigglypip_sprite.svg',
        zone: 'Route 1: Python Meadow',
        greeting: 'Wild JIGGLYPIP puffed up its cheeks and began singing a soothing melody!',
        inspect: 'JIGGLYPIP (#039 Jigglypuff ref): Balloon Fairy Pip! Melodic vibrations entrance any foe.',
        bulletType: 'data',
        moves: [
          { name: 'Hyper Voice', type: 'NORMAL', dmg: 45, desc: 'Resonating ultrasonic voice shockwave' },
          { name: 'Dazzling Gleam', type: 'FAIRY', dmg: 50, desc: 'Radiant brilliant burst of fairy light' },
          { name: 'Sing & Slap', type: 'FAIRY', dmg: 32, desc: 'Hypnotic melody rhythm combo' },
          { name: 'Body Slam', type: 'NORMAL', dmg: 42, desc: 'Heavy full-weight crushing drop' }
        ]
      },
      buggypip: {
        id: '#054',
        name: 'BUGGYPIP',
        level: 28,
        hp: 75,
        maxHp: 75,
        type1: 'PSYCHIC',
        type2: 'WATER',
        badgeClass: 'type-glitch',
        spriteSrc: 'assets/buggypip_sprite.svg',
        zone: 'Route 3: Cyber Matrix',
        greeting: 'Wild BUGGYPIP clutches its temples with glowing psychic eyes!',
        inspect: 'BUGGYPIP (#054 Psyduck ref): Psionic Duck Pip! Releases latent psychic power when perplexed.',
        bulletType: 'glitch',
        moves: [
          { name: 'Confusion', type: 'PSYCHIC', dmg: 42, desc: 'Psionic telekinetic wave of vertigo' },
          { name: 'Water Pulse', type: 'WATER', dmg: 38, desc: 'Ultrasonic ring of pulsating water' },
          { name: 'Zen Headbutt', type: 'PSYCHIC', dmg: 45, desc: 'Focused mind-force forehead smash' },
          { name: 'Psychic', type: 'PSYCHIC', dmg: 55, desc: 'Overwhelming telekinetic crush' }
        ]
      },
      spectrepip: {
        id: '#094',
        name: 'SPECTREPIP',
        level: 28,
        hp: 78,
        maxHp: 78,
        type1: 'GHOST',
        type2: 'POISON',
        badgeClass: 'type-glitch',
        spriteSrc: 'assets/spectrepip_sprite.svg',
        zone: 'Route 3: Cyber Matrix',
        greeting: 'Wild SPECTREPIP materialized from the shadows with a wicked grin!',
        inspect: 'SPECTREPIP (#094 Gengar ref): Shadow Ghost Pip! Lurks in the darkness with playful tricks.',
        bulletType: 'glitch',
        moves: [
          { name: 'Shadow Ball', type: 'GHOST', dmg: 50, desc: 'Dark shadowy orb of phantom energy' },
          { name: 'Night Shade', type: 'GHOST', dmg: 40, desc: 'Terrifying mirage of pure darkness' },
          { name: 'Sludge Bomb', type: 'POISON', dmg: 45, desc: 'Explosive blast of unsanitary sludge' },
          { name: 'Dark Pulse', type: 'DARK', dmg: 48, desc: 'Malevolent dark aura pulse' }
        ]
      },
      voltasync: {
        id: '#081',
        name: 'VOLTASYNC',
        level: 28,
        hp: 80,
        maxHp: 80,
        type1: 'ELECTRIC',
        type2: 'STEEL',
        badgeClass: 'type-fire',
        spriteSrc: 'assets/voltasync_sprite.svg',
        zone: 'Route 3: Cyber Matrix',
        greeting: 'Wild VOLTASYNC spins its horseshoe magnets, crackling with cyan sparks!',
        inspect: 'VOLTASYNC (#081 Magnemite ref): Electromagnetic Steel Pip! Generates magnetic levitation field.',
        bulletType: 'fire',
        moves: [
          { name: 'Thunder Shock', type: 'ELECTRIC', dmg: 40, desc: 'High-voltage electric hook jolt' },
          { name: 'Flash Cannon', type: 'STEEL', dmg: 50, desc: 'Concentrated steel ray laser' },
          { name: 'Zap Cannon', type: 'ELECTRIC', dmg: 60, desc: 'Supercharged electromagnetic plasma' },
          { name: 'Sonic Boom', type: 'NORMAL', dmg: 32, desc: 'Supersonic destructive shockwave' }
        ]
      },
      snorlaxpip: {
        id: '#143',
        name: 'SNORLAXPIP',
        level: 28,
        hp: 140,
        maxHp: 140,
        type1: 'NORMAL',
        type2: 'COZY',
        badgeClass: 'type-code',
        spriteSrc: 'assets/snorlaxpip_sprite.svg',
        zone: 'Route 2: Data Lake',
        greeting: 'Wild SNORLAXPIP is peacefully snoozing across the bridge! "Zzz..."',
        inspect: 'SNORLAXPIP (#143 Snorlax ref): Slumber Bear Pip! Massive HP. Only wakes for delicious snacks.',
        bulletType: 'data',
        moves: [
          { name: 'Body Slam', type: 'NORMAL', dmg: 55, desc: 'Titanic full-weight crushing drop' },
          { name: 'Mega Punch', type: 'NORMAL', dmg: 45, desc: 'Devastating muscular paw blow' },
          { name: 'Giga Impact', type: 'NORMAL', dmg: 65, desc: 'All-out brute force charge' },
          { name: 'Headbutt', type: 'NORMAL', dmg: 38, desc: 'Rock-solid forehead tackle' }
        ]
      },
      neuropip: {
        id: '#150',
        name: 'NEUROPIP',
        level: 28,
        hp: 88,
        maxHp: 88,
        type1: 'PSYCHIC',
        type2: 'AURA',
        badgeClass: 'type-trainer',
        spriteSrc: 'assets/neuropip_sprite.svg',
        zone: 'Route 3: Cyber Matrix',
        greeting: 'Wild NEUROPIP hovered into reality! Its telepathic aura pulses with infinite intellect!',
        inspect: 'NEUROPIP (#150 Mewtwo ref): Genetic Deity Pip! The most powerful psionic force in the realm.',
        bulletType: 'glitch',
        moves: [
          { name: 'Psystrike', type: 'PSYCHIC', dmg: 65, desc: 'Materialized psionic shockwave' },
          { name: 'Psychic', type: 'PSYCHIC', dmg: 55, desc: 'Unstoppable telekinetic burst' },
          { name: 'Aura Sphere', type: 'FIGHTING', dmg: 48, desc: 'Pure aura power that never misses' },
          { name: 'Shadow Ball', type: 'GHOST', dmg: 50, desc: 'Concentrated dark energy sphere' }
        ]
      }
    };

    // Active Battle Variables
    this.currentSpeciesKey = 'flamechar';
    this.pip = null;
    this.isRefactored = false;
    this.isTamed = false;
    this.isDodging = false;
    this.dodgeTimeLeft = 0;
    this.dodgeInterval = null;
    this.bullets = [];

    // Map Dimensions (100 x 80 tiles @ 32px each = 3200 x 2560 expansive world)
    this.mapCols = 100;
    this.mapRows = 80;
    this.tileSize = 32;

    // Preload Player Overworld Sprites (Base Sprite + 4-Direction Walk Spritesheet)
    this.playerSpriteImg = new Image();
    this.playerSpriteImg.src = 'assets/player_sprite.png';

    this.playerSpriteSheet = new Image();
    this.playerSpriteSheet.src = 'assets/player_spritesheet.png';

    // In-game Settings modal state
    this.settingsOpen = false;

    // 5 Gym Leader Badges State
    this.badges = {
      ember: false,
      flora: false,
      tide: false,
      pulse: false,
      cipher: false
    };

    // Active Battle Context (gym leader challenge vs wild)
    this.currentBattleContext = null;

    // Radar Minimap
    this.mmCanvas = null;
    this.mmCtx = null;
    this.mmStaticBg = null;

    // Build Open World Map Tiles & Entity Objects
    this.initWorldMap();

    // Init DOM Hooks
    this.initDOM();
  }

  initWorldMap() {
    // 0: Lab Floor (Parquet)
    // 1: Lab Wall (Solid)
    // 2: Lab Furniture/Desk/PC (Solid)
    // 3: Outdoor Cobble/Dirt Path (Walkable - Gravel walk sound)
    // 4: Outdoor Meadow Grass (Walkable - Grass sound)
    // 5: Tall Wild Grass (Walkable - Grass sound, triggers encounters!)
    // 6: Deep Water (Walkable/Swimmable! - Swim sound)
    // 7: Wooden Bridge (Walkable - Gravel/Wood sound)
    // 8: Cyber Circuit Matrix (Walkable - Obsidian sound)
    // 9: Outer Pine Trees / Border / Monoliths (Solid)
    // 10: Golden Sand Beach Shore (Walkable - Sand sound)
    this.tiles = [];
    for (let r = 0; r < this.mapRows; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < this.mapCols; c++) {
        // Outer boundaries
        if (r === 0 || r === this.mapRows - 1 || c === 0 || c === this.mapCols - 1) {
          this.tiles[r][c] = 9;
        }
        // PALLET DEV LAB BUILDING (c: 3..25, r: 2..18)
        else if (c >= 3 && c <= 25 && r >= 2 && r <= 18) {
          if (r === 2 || c === 3 || c === 25 || (r === 18 && c !== 13 && c !== 14)) {
            this.tiles[r][c] = 1; // Lab Wall (Door at c:13,14)
          } else if (r === 4 && ((c >= 5 && c <= 10) || (c >= 18 && c <= 23))) {
            this.tiles[r][c] = 2; // Lab Computer Desks & Terminals
          } else if (r === 9 && (c >= 20 && c <= 23)) {
            this.tiles[r][c] = 2; // Bookshelves & Servers
          } else {
            this.tiles[r][c] = 0; // Lab Parquet Floor
          }
        }
        // SANCTUARY COURTYARD & PATHS (c: 1..32, r: 1..26)
        else if (c <= 32 && r <= 26) {
          if ((c >= 12 && c <= 15) || r === 19 || r === 25 || (c === 32 && r >= 19)) {
            this.tiles[r][c] = 3; // Cobble Path
          } else {
            this.tiles[r][c] = 4; // Courtyard Grass
          }
        }
        // CROSSROADS HUB (c: 33..48, r: 22..32)
        else if (c >= 33 && c <= 48 && r >= 22 && r <= 32) {
          if (r === 26 || r === 27 || c === 40 || c === 41) {
            this.tiles[r][c] = 3; // Main Crossroad Highway
          } else {
            this.tiles[r][c] = 4; // Hub Grass
          }
        }
        // ROUTE 2: WHISPERING DATA LAKE & SANDY BEACH (Bottom-Left: c: 1..46, r: 33..78)
        else if (c <= 46 && r >= 33) {
          // Golden sand beach perimeter around entire lake!
          if (c <= 5 || c >= 42 || r <= 36 || r >= 75) {
            this.tiles[r][c] = 10; // Golden Sand Beach Shore
          }
          // Main North-South Wooden Bridge: c: 22..24, r: 37..52
          else if ((c >= 22 && c <= 24) && r >= 37 && r <= 52) {
            this.tiles[r][c] = 7; // Wooden Bridge
          }
          // Azure Marina Gym Island: c: 19..27, r: 53..60
          else if (c >= 19 && c <= 27 && r >= 53 && r <= 60) {
            this.tiles[r][c] = (r === 53 || r === 60 || c === 19 || c === 27) ? 7 : 10; // Marina Sand / Pier Deck
          }
          // South Bridge to Shore: c: 22..24, r: 61..74
          else if ((c >= 22 && c <= 24) && r >= 61 && r <= 74) {
            this.tiles[r][c] = 7; // Wooden Bridge
          }
          // East lake walkway to Matrix: c: 25..44, r: 46..47
          else if (r >= 46 && r <= 47 && c >= 25 && c <= 44) {
            this.tiles[r][c] = 7; // Bridge
          }
          else {
            this.tiles[r][c] = 6; // Deep Swimmable Water!
          }
        }
        // ROUTE 3: OBSIDIAN GLITCHLANDS & CYBER MATRIX (Bottom-Right: c: 47..98, r: 33..78)
        else if (c >= 47 && r >= 33) {
          // Cyber divider paths
          if (c === 47 || r === 33 || c === 72 || r === 56) {
            this.tiles[r][c] = 3; // Path divider
          }
          // Cyber server pillars / monoliths
          else if ((r === 42 || r === 62 || r === 70) && (c === 60 || c === 82 || c === 92)) {
            this.tiles[r][c] = 9; // Server Monolith
          }
          // Gym 5 Obsidian Void Sanctum (c: 80..92, r: 60..72)
          else if (c >= 80 && c <= 92 && r >= 60 && r <= 72) {
            this.tiles[r][c] = (c === 80 || c === 92 || r === 60 || r === 72) ? 9 : 8; // Sanctum Ring
          }
          else {
            this.tiles[r][c] = 8; // Cyber Circuit Matrix (Obsidian Floor)
          }
        }
        // ROUTE 1: VERDANT MEADOW & ARBORETUM (Top-Right: c: 33..98, r: 1..32)
        else {
          // Cobble Path Network
          if (r === 18 || r === 19 || c === 54 || c === 55 || (r === 10 && c >= 42 && c <= 90) || (c === 88 && r >= 10 && r <= 20)) {
            this.tiles[r][c] = 3; // Cobble Path
          }
          // Tall Wild Grass Patches (triggers encounters!)
          else if (
            (c >= 36 && c <= 50 && r >= 4 && r <= 16) ||
            (c >= 58 && c <= 78 && r >= 4 && r <= 15) ||
            (c >= 64 && c <= 86 && r >= 17 && r <= 28) ||
            (c >= 90 && c <= 96 && r >= 8 && r <= 28)
          ) {
            this.tiles[r][c] = 5; // Tall Wild Grass
          }
          // Pine tree groves
          else if ((r === 6 || r === 24) && (c === 62 || c === 82)) {
            this.tiles[r][c] = 9; // Decorative Pine
          }
          else {
            this.tiles[r][c] = 4; // Meadow Grass
          }
        }
      }
    }

    // 5 Official Regional Gym Leaders (Distributed across 100x80 world)
    this.gymLeaders = [
      {
        id: 'gym_brock',
        name: 'PYRO BROCK',
        gymName: 'Ember Core Gym',
        badge: 'EMBER',
        badgeKey: 'ember',
        x: 54 * 32,
        y: 10 * 32,
        color: '#dc2626',
        hatColor: '#ef4444',
        signatureSpecies: 'flamechar',
        defeated: false,
        challengeSpeech: "I am Gym Leader Brock! My fiery Flamechar burns with the raw heat of compiled machine code! Show me your passion, Trainer!",
        victorySpeech: "Remarkable execution! You cooled my burning flame. I officially bestow upon you the Ember Badge!"
      },
      {
        id: 'gym_erika',
        name: 'FLORA ERIKA',
        gymName: 'Meadow Arboretum Gym',
        badge: 'FLORA',
        badgeKey: 'flora',
        x: 88 * 32,
        y: 14 * 32,
        color: '#16a34a',
        hatColor: '#86efac',
        signatureSpecies: 'bulbasprout',
        defeated: false,
        challengeSpeech: "Welcome to the Meadow Arboretum. Algorithms and organic nature flourish in harmony here. Face my Bulbasprout!",
        victorySpeech: "A truly elegant performance. Your strategy has blossomed. Take this official Flora Badge!"
      },
      {
        id: 'gym_misty',
        name: 'MISTY TIDE',
        gymName: 'Azure Marina Gym',
        badge: 'TIDE',
        badgeKey: 'tide',
        x: 23 * 32,
        y: 56 * 32,
        color: '#0284c7',
        hatColor: '#38bdf8',
        signatureSpecies: 'aquabyte',
        defeated: false,
        challengeSpeech: "You navigated the deep waters to reach my Marina Gym! My Aquabyte has unshakeable defenses and crushing Hydro Pumps!",
        victorySpeech: "Splendid sailing! You outmaneuvered my tidal waves. Wear this Tide Badge with honor!"
      },
      {
        id: 'gym_volt',
        name: 'LT. VOLT',
        gymName: 'Cyber Pulse Gym',
        badge: 'PULSE',
        badgeKey: 'pulse',
        x: 72 * 32,
        y: 46 * 32,
        color: '#eab308',
        hatColor: '#fde047',
        signatureSpecies: 'voltasync',
        defeated: false,
        challengeSpeech: "Ten-hut! The Pulse Gym runs on 100 Gigabits of raw electric discharge! Sparkpip and Voltasync will overload your circuits!",
        victorySpeech: "Surge protection triggered! You grounded my highest voltages. You've earned the Pulse Badge!"
      },
      {
        id: 'gym_giovanni',
        name: 'GIOVANNI CIPHER',
        gymName: 'Obsidian Void Gym',
        badge: 'CIPHER',
        badgeKey: 'cipher',
        x: 86 * 32,
        y: 66 * 32,
        color: '#7c3aed',
        hatColor: '#c084fc',
        signatureSpecies: 'neuropip',
        defeated: false,
        challengeSpeech: "Fascinating... you traversed the entire realm to reach the Obsidian Void. I command Neuropip—supreme intellect of the Prime Core. Prove your mastery!",
        victorySpeech: "Astonishing... your bond with your team shattered my telepathic barrier. I concede. Receive the ultimate Cipher Badge!"
      }
    ];

    // NPCs across all regions
    this.npcs = [
      {
        id: 'oak',
        name: 'ARCHIVIST OAK',
        x: 12 * 32,
        y: 5 * 32,
        color: '#dc2626',
        hatColor: '#ffffff',
        dialogueIndex: 0,
        dialogues: [
          "Greetings, young Trainer! The Prime Core has fractured across five elemental biomes, scattering the wild Pips and rousing the five Gym Leaders.",
          "Your quest is to explore the vast expanded realm, defeat all 5 Gym Leaders to claim their Badges, and tame all 10 Sacred Pips in your Pip-Dex!",
          "Use the Radar Minimap on your top-left corner to locate the 5 Gym Leaders and navigate the vast terrain!"
        ]
      },
      {
        id: 'nurse_chai',
        name: 'NURSE CHAI (OASIS HUB)',
        x: 6 * 32,
        y: 5 * 32,
        color: '#f43f5e',
        hatColor: '#fecdd3',
        dialogueIndex: 0,
        dialogues: [
          "Welcome to the Oasis Waystation! Let me brew a restorative pot of celestial blossom tea... All your HP has been fully restored to 100%! Safe travels!",
          "If your team ever falls low on vitality after an intense encounter or Gym battle, return here anytime!"
        ],
        action: () => this.healTrainer()
      },
      {
        id: 'pip_researcher',
        name: 'RESEARCHER MAYA',
        x: 18 * 32,
        y: 9 * 32,
        color: '#8b5cf6',
        hatColor: '#c4b5fd',
        dialogueIndex: 0,
        dialogues: [
          "I study elemental affinity! Fire burns Grass, Grass absorbs Water, Water douses Fire, and Electric shocks everything!",
          "The five Gym Leaders represent the pinnacle of each discipline. Defeat them all to become the Grand Arbiter!"
        ]
      },
      {
        id: 'ranger_kael',
        name: 'MEADOW RANGER KAEL',
        x: 42 * 32,
        y: 16 * 32,
        color: '#2563eb',
        hatColor: '#1d4ed8',
        dialogueIndex: 0,
        dialogues: [
          "Welcome to Route 1's vast Verdant Meadow! Just north is Pyro Brock's Ember Core Gym, and to the far east is Flora Erika's Arboretum Gym.",
          "Sparkpip and Flamechar roam freely in these sunny tall grass fields."
        ]
      },
      {
        id: 'diver_mira',
        name: 'LAKE GUARDIAN MIRA',
        x: 22 * 32,
        y: 28 * 32,
        color: '#0284c7',
        hatColor: '#38bdf8',
        dialogueIndex: 0,
        dialogues: [
          "You stand at the northern shores of Route 2's Whispering Data Lake. Cross the long bridge south to reach Gym Leader Misty Tide at the Marina Pier!",
          "Watch out for slumbering Snorlaxpip across the water!"
        ]
      },
      {
        id: 'fisherman_tide',
        name: 'OLD ANGLER FINN',
        x: 16 * 32,
        y: 54 * 32,
        color: '#059669',
        hatColor: '#34d399',
        dialogueIndex: 0,
        dialogues: [
          "Ahoy! Misty Tide is one of the sharpest Gym Leaders in the region. Her Aquabyte's Hydro Pump is legendary!"
        ]
      },
      {
        id: 'speedrun_alex',
        name: 'ACE TRAINER ALEX',
        x: 62 * 32,
        y: 18 * 32,
        color: '#ea580c',
        hatColor: '#f97316',
        dialogueIndex: 0,
        dialogues: [
          "I'm training to take on Lt. Volt in Route 3's Cyber Matrix! His electric currents are blistering fast!",
          "Remember: during enemy turns, guide your soul in the battle box to dodge glitch energy bullets!"
        ]
      },
      {
        id: 'cipher_sage',
        name: 'ARCHON CIPHER',
        x: 52 * 32,
        y: 42 * 32,
        color: '#7c3aed',
        hatColor: '#a78bfa',
        dialogueIndex: 0,
        dialogues: [
          "HALT! You stand in the Obsidian Glitchlands. Deep in the southeastern sanctum waits Giovanni Cipher and the genetic deity Neuropip (#150).",
          "Only a Trainer who has conquered the other Gyms can hope to withstand the Void Gym!"
        ]
      }
    ];

    // Interactive Objects (Healing Station, Ancient Core PC, Signs, Items)
    this.interactives = [
      {
        type: 'heal',
        x: 5 * 32,
        y: 4 * 32,
        label: 'Oasis Waystation',
        action: () => this.healTrainer()
      },
      {
        type: 'pc',
        x: 16 * 32,
        y: 4 * 32,
        label: 'Prime Archive Terminal',
        action: () => {
          this.setMode('lore');
        }
      },
      {
        type: 'sign',
        x: 11 * 32,
        y: 16 * 32,
        text: "ARCHIVIST SANCTUARY: Research post of the Prime Core. North: Lab & Healing. South: Exit to Crossroads."
      },
      {
        type: 'sign',
        x: 32 * 32,
        y: 22 * 32,
        text: "CENTRAL CROSSROADS: North-East: Route 1 (Verdant Meadow & Ember/Flora Gyms). South-West: Route 2 (Data Lake & Tide Gym). South-East: Route 3 (Glitchlands & Pulse/Void Gyms)."
      },
      {
        type: 'sign',
        x: 42 * 32,
        y: 10 * 32,
        text: "GYM 1: EMBER CORE GYM. Leader: PYRO BROCK. Type: Fire/Rock."
      },
      {
        type: 'sign',
        x: 52 * 32,
        y: 10 * 32,
        text: "GYM 1: EMBER CORE GYM. Leader: PYRO BROCK. Type: Fire/Rock."
      },
      {
        type: 'sign',
        x: 86 * 32,
        y: 14 * 32,
        text: "GYM 2: MEADOW ARBORETUM GYM. Leader: FLORA ERIKA. Type: Grass/Nature."
      },
      {
        type: 'sign',
        x: 21 * 32,
        y: 54 * 32,
        text: "GYM 3: AZURE MARINA GYM. Leader: MISTY TIDE. Type: Water/Ice."
      },
      {
        type: 'sign',
        x: 70 * 32,
        y: 46 * 32,
        text: "GYM 4: CYBER PULSE GYM. Leader: LT. VOLT. Type: Electric/Protocol."
      },
      {
        type: 'sign',
        x: 84 * 32,
        y: 64 * 32,
        text: "GYM 5: OBSIDIAN VOID GYM. Leader: GIOVANNI CIPHER. Type: Psychic/Glitch."
      },
      {
        type: 'item',
        x: 76 * 32,
        y: 8 * 32,
        name: '3x Pip-Capsules',
        collected: false,
        grant: () => {
          this.inventory.capsules += 3;
          this.showDialogue('FOUND ITEM', "You obtained 3x Pip-Capsules! High-tech spherical orbs designed to capture wild Pips.");
        }
      },
      {
        type: 'item',
        x: 8 * 32,
        y: 68 * 32,
        name: 'Sacred Elixir',
        collected: false,
        grant: () => {
          this.inventory.elixirs += 1;
          this.showDialogue('FOUND ITEM', "You obtained a Sacred Elixir (+60 HP Restore)! Brewed from crystal spring herbs.");
        }
      },
      {
        type: 'item',
        x: 90 * 32,
        y: 40 * 32,
        name: 'Rare Candy',
        collected: false,
        grant: () => {
          this.inventory.candies += 1;
          this.showDialogue('FOUND ITEM', "You obtained a Rare Candy (+1 Level Boost)! Crackling with ancient Core energy.");
        }
      }
    ];

    // Roaming Wild Pips in Open World (Expanded 100x80 Map)
    this.roamingPips = [
      { species: 'flamechar', x: 48 * 32, y: 12 * 32, origX: 48 * 32, origY: 12 * 32, wander: 1.5, active: true },
      { species: 'bulbasprout', x: 68 * 32, y: 10 * 32, origX: 68 * 32, origY: 10 * 32, wander: 1.5, active: true },
      { species: 'jigglypip', x: 80 * 32, y: 22 * 32, origX: 80 * 32, origY: 22 * 32, wander: 1.2, active: true },
      { species: 'aquabyte', x: 18 * 32, y: 46 * 32, origX: 18 * 32, origY: 46 * 32, wander: 1.6, active: true }, // Swimming in lake!
      { species: 'snorlaxpip', x: 8 * 32, y: 38 * 32, origX: 8 * 32, origY: 38 * 32, wander: 0.6, active: true }, // Relaxing on sand beach
      { species: 'sparkpip', x: 58 * 32, y: 24 * 32, origX: 58 * 32, origY: 24 * 32, wander: 1.8, active: true },
      { species: 'voltasync', x: 62 * 32, y: 42 * 32, origX: 62 * 32, origY: 42 * 32, wander: 1.5, active: true },
      { species: 'buggypip', x: 78 * 32, y: 46 * 32, origX: 78 * 32, origY: 46 * 32, wander: 1.5, active: true },
      { species: 'spectrepip', x: 56 * 32, y: 64 * 32, origX: 56 * 32, origY: 64 * 32, wander: 1.4, active: true },
      { species: 'neuropip', x: 86 * 32, y: 68 * 32, origX: 86 * 32, origY: 68 * 32, wander: 1.0, active: true }
    ];
  }

  buildMinimapCache() {
    this.minimapBg = document.createElement('canvas');
    this.minimapBg.width = 120;
    this.minimapBg.height = 90;
    const mctx = this.minimapBg.getContext('2d');
    const scaleX = 120 / this.mapCols;
    const scaleY = 90 / this.mapRows;

    for (let r = 0; r < this.mapRows; r++) {
      for (let c = 0; c < this.mapCols; c++) {
        const t = this.tiles[r][c];
        let color = '#4d7c0f';
        if (t === 0 || t === 1 || t === 2) color = '#475569';
        else if (t === 3 || t === 7) color = '#d97706';
        else if (t === 4) color = '#65a30d';
        else if (t === 5) color = '#3f6212';
        else if (t === 6) color = '#0284c7';
        else if (t === 8) color = '#0f172a';
        else if (t === 9) color = '#14532d';
        else if (t === 10) color = '#f59e0b'; // Golden Sand Beach Shore
        mctx.fillStyle = color;
        mctx.fillRect(c * scaleX, r * scaleY, scaleX + 0.1, scaleY + 0.1);
      }
    }
  }

  initDOM() {
    this.owCanvas = document.getElementById('pip-overworld-canvas');
    this.minimapCanvas = document.getElementById('pip-minimap-canvas');
    if (this.minimapCanvas) this.minimapCtx = this.minimapCanvas.getContext('2d');
    this.buildMinimapCache();

    if (this.owCanvas) {
      this.owCtx = this.owCanvas.getContext('2d');
      // Direct click on canvas to talk to NPCs, Gym Leaders, or interact
      this.owCanvas.addEventListener('click', (e) => {
        if (this.mode !== 'overworld') return;
        if (this.dialogueActive) {
          this.closeDialogue();
          return;
        }
        const rect = this.owCanvas.getBoundingClientRect();
        const scaleX = this.owCanvas.width / rect.width;
        const scaleY = this.owCanvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX + this.camera.x;
        const clickY = (e.clientY - rect.top) * scaleY + this.camera.y;

        // Check if clicked directly near any Gym Leader
        for (const gym of this.gymLeaders) {
          const d = Math.hypot(clickX - (gym.x + 16), clickY - (gym.y + 16));
          if (d < 42) {
            sfx.playClick();
            if (gym.defeated) {
              this.showDialogue(gym.name, gym.victorySpeech || `You already conquered the ${gym.gymName}! Safe travels!`);
            } else {
              this.showDialogue(gym.name, gym.challengeSpeech, () => this.startGymBattle(gym));
            }
            return;
          }
        }

        // Check if clicked directly near any NPC
        for (const npc of this.npcs) {
          const d = Math.hypot(clickX - (npc.x + 16), clickY - (npc.y + 16));
          if (d < 38) {
            sfx.playClick();
            if (npc.action) {
              npc.action();
            } else {
              const msg = npc.dialogues ? npc.dialogues[npc.dialogueIndex % npc.dialogues.length] : (npc.dialogue || "Safe travels, Trainer!");
              if (npc.dialogues) npc.dialogueIndex++;
              this.showDialogue(npc.name, msg);
            }
            return;
          }
        }

        // Check if clicked directly near any interactive object
        for (const obj of this.interactives) {
          const d = Math.hypot(clickX - (obj.x + 16), clickY - (obj.y + 16));
          if (d < 38) {
            sfx.playClick();
            if (obj.action) obj.action();
            else if (obj.type === 'sign') this.showDialogue('SIGNPOST', obj.text);
            else if (obj.type === 'item' && !obj.collected) {
              obj.collected = true;
              sfx.playItemChime();
              obj.grant();
            }
            return;
          }
        }

        // Otherwise trigger regular action press
        this.handleActionPress();
      });
    }

    this.dodgeCanvas = document.getElementById('pip-dodge-canvas');
    if (this.dodgeCanvas) this.dodgeCtx = this.dodgeCanvas.getContext('2d');

    // Preload trainer avatar
    this.pfpImage = new Image();
    this.pfpImage.src = 'assets/profile.jpg';

    // Keyboard controls (WASD to move, Shift to sprint, E to interact, Q for Pokédex, F for fullscreen, Esc to minimize, R to escape battle)
    window.addEventListener('keydown', (e) => {
      // Only process when game view is active
      const gameViewActive = document.getElementById('game-view')?.classList.contains('active');
      if (!gameViewActive) return;

      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' ', 'e', 'q', 'r', 'f', 'escape'].includes(k)) {
        if (this.mode === 'overworld' || this.isDodging || this.mode === 'battle' || this.mode === 'dex') e.preventDefault();
      }
      this.keys[k] = true;

      // Sprinting via Shift
      if (e.key === 'Shift') this.player.isSprinting = true;

      // Fullscreen toggle via [F]
      if (k === 'f') {
        this.toggleFullscreen();
        return;
      }

      // Open / Toggle In-Game Settings & Volume Control via [Escape]
      if (k === 'escape') {
        this.toggleSettings();
        return;
      }

      // Escape wild Pokémon encounter via [R]
      if (k === 'r') {
        if (this.mode === 'battle') {
          this.escapeBattle();
          return;
        }
      }

      // Interact via [E], Space, Enter, or Z
      if (k === 'e' || k === ' ' || k === 'enter' || k === 'z') {
        if (this.dialogueActive) {
          this.closeDialogue();
        } else if (this.mode === 'overworld') {
          this.handleActionPress();
        } else if (this.mode === 'battle') {
          this.finishDialogueInstantly();
        }
      }

      // Pokédex toggle via [Q]
      if (k === 'q' || k === 'x') {
        if (this.mode === 'dex') this.setMode('overworld');
        else if (this.mode === 'overworld') this.setMode('dex');
      }

      // Realm Lore toggle via [L]
      if (k === 'l') {
        if (this.mode === 'lore') this.setMode('overworld');
        else if (this.mode === 'overworld') this.setMode('lore');
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = false;
      if (e.key === 'Shift') this.player.isSprinting = false;
    });

    // Touch D-Pad Handheld Buttons
    document.querySelectorAll('.pip-handheld-controls .dpad-btn, .pip-touch-dpad .dpad-btn').forEach(btn => {
      const dir = btn.getAttribute('data-dir');
      const startMove = (e) => {
        e.preventDefault();
        this.keys[dir] = true;
      };
      const stopMove = (e) => {
        e.preventDefault();
        this.keys[dir] = false;
      };
      btn.addEventListener('mousedown', startMove);
      btn.addEventListener('mouseup', stopMove);
      btn.addEventListener('mouseleave', stopMove);
      btn.addEventListener('touchstart', startMove, { passive: false });
      btn.addEventListener('touchend', stopMove, { passive: false });
    });

    // Handheld [A] and [B] buttons
    document.getElementById('btn-ctrl-a')?.addEventListener('click', () => this.handleActionPress());
    document.getElementById('btn-ctrl-b')?.addEventListener('mousedown', () => { this.player.isSprinting = true; });
    document.getElementById('btn-ctrl-b')?.addEventListener('mouseup', () => { this.player.isSprinting = false; });
    document.getElementById('btn-ctrl-b')?.addEventListener('click', () => {
      if (this.dialogueActive) this.closeDialogue();
      else if (this.mode === 'dex' || this.mode === 'lore') this.setMode('overworld');
    });

    // Cabinet Top Strip Buttons
    document.getElementById('game-mode-toggle-btn')?.addEventListener('click', () => {
      sfx.playClick();
      if (this.mode === 'overworld') this.startBattle(this.currentSpeciesKey);
      else this.setMode('overworld');
    });

    document.getElementById('game-dex-toggle-btn')?.addEventListener('click', () => {
      sfx.playClick();
      if (this.mode === 'dex') this.setMode('overworld');
      else this.setMode('dex');
    });

    document.getElementById('dex-close-btn')?.addEventListener('click', () => {
      sfx.playClick();
      this.setMode('overworld');
    });

    document.getElementById('game-lore-toggle-btn')?.addEventListener('click', () => {
      sfx.playClick();
      if (this.mode === 'lore') this.setMode('overworld');
      else this.setMode('lore');
    });

    document.getElementById('lore-close-btn')?.addEventListener('click', () => {
      sfx.playClick();
      this.setMode('overworld');
    });

    // Dialogue Dismiss on click
    document.getElementById('ow-dialogue-box')?.addEventListener('click', () => {
      this.closeDialogue();
    });

    // Battle Action Buttons
    document.getElementById('btn-pip-fight')?.addEventListener('click', () => this.openSubmenu('fight'));
    document.getElementById('btn-pip-act')?.addEventListener('click', () => this.openSubmenu('act'));
    document.getElementById('btn-pip-item')?.addEventListener('click', () => this.openSubmenu('item'));
    document.getElementById('btn-pip-mercy')?.addEventListener('click', () => this.openSubmenu('mercy'));
    document.getElementById('submenu-back-btn')?.addEventListener('click', () => this.closeSubmenu());

    // Instant dialogue skip on clicking dialogue box in battle
    document.getElementById('pip-dialogue-section')?.addEventListener('click', () => {
      this.finishDialogueInstantly();
    });

    // Sync fullscreen mode class on native fullscreen change
    document.addEventListener('fullscreenchange', () => {
      const gView = document.getElementById('game-view');
      if (gView) {
        gView.classList.toggle('fullscreen-mode', !!document.fullscreenElement);
      }
    });

    // In-Game Settings Modal Controls & Volume Sliders
    document.getElementById('game-settings-toggle-btn')?.addEventListener('click', () => {
      sfx.playClick();
      this.toggleSettings();
    });

    document.getElementById('settings-close-btn')?.addEventListener('click', () => {
      sfx.playClick();
      this.closeSettings();
    });

    document.getElementById('settings-resume-btn')?.addEventListener('click', () => {
      sfx.playClick();
      this.closeSettings();
    });

    document.getElementById('settings-desktop-btn')?.addEventListener('click', () => {
      sfx.playClick();
      this.closeSettings();
      if (document.fullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      }
      const gView = document.getElementById('game-view');
      if (gView) gView.classList.remove('fullscreen-mode');
      switchView('desktop');
    });

    // Master Volume Slider
    const masterSlider = document.getElementById('slider-master-vol');
    const masterValBadge = document.getElementById('val-master-vol');
    if (masterSlider) {
      masterSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (masterValBadge) masterValBadge.textContent = `${val}%`;
        sfx.setMasterVolume(val / 100);
      });
    }

    // BGM Volume Slider & Toggle
    const bgmSlider = document.getElementById('slider-bgm-vol');
    const bgmValBadge = document.getElementById('val-bgm-vol');
    const bgmToggleBtn = document.getElementById('btn-toggle-bgm');
    if (bgmSlider) {
      bgmSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (bgmValBadge) bgmValBadge.textContent = `${val}%`;
        sfx.setBgmVolume(val / 100);
      });
    }
    if (bgmToggleBtn) {
      bgmToggleBtn.addEventListener('click', () => {
        const enabled = sfx.toggleBgm();
        bgmToggleBtn.textContent = enabled ? 'ON' : 'OFF';
        bgmToggleBtn.classList.toggle('active', enabled);
        sfx.playClick();
      });
    }

    // SFX Volume Slider & Toggle
    const sfxSlider = document.getElementById('slider-sfx-vol');
    const sfxValBadge = document.getElementById('val-sfx-vol');
    const sfxToggleBtn = document.getElementById('btn-toggle-sfx');
    if (sfxSlider) {
      sfxSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (sfxValBadge) sfxValBadge.textContent = `${val}%`;
        sfx.setSfxVolume(val / 100);
      });
    }
    if (sfxToggleBtn) {
      sfxToggleBtn.addEventListener('click', () => {
        const enabled = sfx.toggleSfx();
        sfxToggleBtn.textContent = enabled ? 'ON' : 'OFF';
        sfxToggleBtn.classList.toggle('active', enabled);
        sfx.playClick();
      });
    }
  }

  openSettings() {
    this.settingsOpen = true;
    const overlay = document.getElementById('pip-settings-overlay');
    if (overlay) overlay.style.display = 'flex';
    this.syncSettingsUI();
  }

  closeSettings() {
    this.settingsOpen = false;
    const overlay = document.getElementById('pip-settings-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  toggleSettings() {
    if (this.settingsOpen) {
      this.closeSettings();
    } else {
      this.openSettings();
    }
  }

  syncSettingsUI() {
    const masterSlider = document.getElementById('slider-master-vol');
    const masterValBadge = document.getElementById('val-master-vol');
    const bgmSlider = document.getElementById('slider-bgm-vol');
    const bgmValBadge = document.getElementById('val-bgm-vol');
    const bgmToggleBtn = document.getElementById('btn-toggle-bgm');
    const sfxSlider = document.getElementById('slider-sfx-vol');
    const sfxValBadge = document.getElementById('val-sfx-vol');
    const sfxToggleBtn = document.getElementById('btn-toggle-sfx');

    const mVal = Math.round(sfx.masterVolume * 100);
    const bVal = Math.round(sfx.bgmVolume * 100);
    const sVal = Math.round(sfx.sfxVolume * 100);

    if (masterSlider) masterSlider.value = mVal;
    if (masterValBadge) masterValBadge.textContent = `${mVal}%`;

    if (bgmSlider) bgmSlider.value = bVal;
    if (bgmValBadge) bgmValBadge.textContent = `${bVal}%`;
    if (bgmToggleBtn) {
      bgmToggleBtn.textContent = sfx.bgmEnabled ? 'ON' : 'OFF';
      bgmToggleBtn.classList.toggle('active', sfx.bgmEnabled);
    }

    if (sfxSlider) sfxSlider.value = sVal;
    if (sfxValBadge) sfxValBadge.textContent = `${sVal}%`;
    if (sfxToggleBtn) {
      sfxToggleBtn.textContent = sfx.sfxEnabled ? 'ON' : 'OFF';
      sfxToggleBtn.classList.toggle('active', sfx.sfxEnabled);
    }
  }

  setMode(targetMode) {
    this.mode = targetMode;

    const owView = document.getElementById('view-overworld');
    const battleView = document.getElementById('view-battle');
    const dexView = document.getElementById('view-dex');
    const loreView = document.getElementById('view-lore');
    const modeBtnText = document.getElementById('game-mode-text');

    if (owView) owView.style.display = targetMode === 'overworld' ? 'block' : 'none';
    if (battleView) battleView.style.display = targetMode === 'battle' ? 'block' : 'none';
    if (dexView) dexView.style.display = targetMode === 'dex' ? 'block' : 'none';
    if (loreView) loreView.style.display = targetMode === 'lore' ? 'block' : 'none';

    if (modeBtnText) {
      if (targetMode === 'overworld') modeBtnText.textContent = 'Open World';
      else if (targetMode === 'battle') modeBtnText.textContent = 'Battle Arena';
      else if (targetMode === 'dex') modeBtnText.textContent = 'Pip-Dex';
      else if (targetMode === 'lore') modeBtnText.textContent = 'Realm Lore';
    }

    if (targetMode === 'overworld') {
      this.startOverworldLoop();
      this.stopDodging();
    } else if (targetMode === 'battle') {
      cancelAnimationFrame(this.owAnimId);
    } else if (targetMode === 'dex') {
      cancelAnimationFrame(this.owAnimId);
      this.renderDexUI();
    } else if (targetMode === 'lore') {
      cancelAnimationFrame(this.owAnimId);
    }
  }

  onEnter() {
    this.updateHUD();
    this.setMode('overworld');
    sfx.setBgmForView('game');
  }

  onLeave() {
    cancelAnimationFrame(this.owAnimId);
    this.stopDodging();
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
    const gView = document.getElementById('game-view');
    if (gView) gView.classList.remove('fullscreen-mode');
    sfx.stopAllBgm();
  }

  // ========================================================
  // 2D OPEN WORLD ENGINE (TILING, ENTITIES, WALKING ANIMATIONS)
  // ========================================================
  startOverworldLoop() {
    cancelAnimationFrame(this.owAnimId);
    const loop = () => {
      if (this.mode !== 'overworld') return;
      this.updateOverworldPhysics();
      this.drawOverworld();
      this.owAnimId = requestAnimationFrame(loop);
    };
    this.owAnimId = requestAnimationFrame(loop);
  }

  updateOverworldPhysics() {
    if (this.dialogueActive || this.settingsOpen) return;

    const p = this.player;
    let dx = 0;
    let dy = 0;

    // Movement keys
    if (this.keys['arrowup'] || this.keys['w'] || this.keys['up']) { dy -= 1; p.dir = 1; }
    if (this.keys['arrowdown'] || this.keys['s'] || this.keys['down']) { dy += 1; p.dir = 0; }
    if (this.keys['arrowleft'] || this.keys['a'] || this.keys['left']) { dx -= 1; p.dir = 2; }
    if (this.keys['arrowright'] || this.keys['d'] || this.keys['right']) { dx += 1; p.dir = 3; }

    const curSpeed = p.isSprinting ? p.sprintSpeed : p.speed;

    if (dx !== 0 || dy !== 0) {
      p.isMoving = true;
      p.animTimer++;
      if (p.animTimer > (p.isSprinting ? 6 : 10)) {
        p.animFrame = (p.animFrame + 1) % 4;
        p.animTimer = 0;
      }

      // Footstep audio per surface type (obsidian, water/swim, grass, sand, gravel)
      const pTileCol = Math.floor((p.x + p.w / 2) / this.tileSize);
      const pTileRow = Math.floor((p.y + p.h / 2) / this.tileSize);
      const curTile = (this.tiles[pTileRow] && this.tiles[pTileRow][pTileCol] !== undefined) ? this.tiles[pTileRow][pTileCol] : 4;
      let walkSurface = 'gravel';
      if (curTile === 6) {
        walkSurface = 'water';
      } else if (curTile === 4 || curTile === 5) {
        walkSurface = 'grass';
      } else if (curTile === 10) {
        walkSurface = 'sand';
      } else if (curTile === 8) {
        walkSurface = 'obsidian';
      } else {
        walkSurface = 'gravel';
      }
      sfx.playWalk(walkSurface);

      // Normalize diagonal
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const nextX = p.x + dx * curSpeed;
      const nextY = p.y + dy * curSpeed;

      // Collision checks with solid tiles
      if (!this.checkSolidCollision(nextX, p.y)) p.x = nextX;
      if (!this.checkSolidCollision(p.x, nextY)) p.y = nextY;

      // Sprint dust particles
      if (p.isSprinting && Math.random() < 0.3) {
        p.dustParticles.push({
          x: p.x + 12 + (Math.random() - 0.5) * 8,
          y: p.y + 24,
          r: 2 + Math.random() * 2,
          life: 1.0
        });
      }

      // Stepping inside Tall Wild Grass (Tile 5)
      const tileCol = Math.floor((p.x + p.w / 2) / this.tileSize);
      const tileRow = Math.floor((p.y + p.h / 2) / this.tileSize);
      const inGrass = (this.tiles[tileRow] && this.tiles[tileRow][tileCol] === 5);

      if (inGrass) {
        // Dynamic grass rustle particles
        if (Math.random() < 0.28) {
          p.grassParticles.push({
            x: p.x + 12 + (Math.random() - 0.5) * 12,
            y: p.y + 24 + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 1.5 - 0.5,
            life: 1.0,
            color: Math.random() < 0.5 ? '#15803d' : '#86efac'
          });
        }

        const distMoved = Math.hypot(dx * curSpeed, dy * curSpeed);
        p.grassTravel = (p.grassTravel || 0) + distMoved;

        // A discrete footstep is ~26 pixels moved:
        if (p.grassTravel >= 26) {
          p.grassTravel = 0;

          // Grace period cooldown after battle so encounters are not annoying
          if (this.graceSteps > 0) {
            this.graceSteps--;
          } else {
            this.grassStepCount = (this.grassStepCount || 0) + 1;
            // 5% in 1 step, 10% in 2 steps, ... 100% in 20 steps!
            const encounterChance = Math.min(1.0, this.grassStepCount * 0.05);

            if (Math.random() < encounterChance) {
              this.grassStepCount = 0;
              this.graceSteps = 10; // 10 steps grace cooldown so encounters never get annoying!
              this.triggerWildEncounter(); // Random encounter with ANY Pip!
              return;
            }
          }
        }
      } else {
        p.grassTravel = 0;
      }

      // Check collision with roaming wild Pips
      this.roamingPips.forEach(rp => {
        if (!rp.active) return;
        const dist = Math.hypot((p.x + p.w / 2) - (rp.x + 16), (p.y + p.h / 2) - (rp.y + 16));
        if (dist < 26) {
          this.triggerWildEncounter(rp.species);
        }
      });

      // Update zone banner name
      this.updateCurrentZoneName(tileCol, tileRow);

      // Record player trail for following partner Pokemon (HGSS following mechanic)
      if (!p.trail) p.trail = [];
      p.trail.unshift({ x: p.x, y: p.y, dir: p.dir });
      if (p.trail.length > 25) p.trail.pop();
    } else {
      p.isMoving = false;
      p.animFrame = 0;
    }

    // Update dust & grass particles
    for (let i = p.dustParticles.length - 1; i >= 0; i--) {
      const dp = p.dustParticles[i];
      dp.life -= 0.05;
      dp.y -= 0.4;
      if (dp.life <= 0) p.dustParticles.splice(i, 1);
    }
    for (let i = p.grassParticles.length - 1; i >= 0; i--) {
      const gp = p.grassParticles[i];
      gp.x += gp.vx;
      gp.y += gp.vy;
      gp.life -= 0.04;
      if (gp.life <= 0) p.grassParticles.splice(i, 1);
    }

    // HeartGold partner following update
    if (this.partner) {
      if (!p.trail) p.trail = [];
      const followDelay = p.isSprinting ? 8 : 12;
      if (p.trail.length > followDelay) {
        const target = p.trail[followDelay];
        this.partner.x += (target.x - this.partner.x) * 0.22;
        this.partner.y += (target.y - this.partner.y) * 0.22;
        this.partner.dir = target.dir;
      }
    }

    // Autumn wind leaves animation update
    if (this.windLeaves) {
      this.windLeaves.forEach(leaf => {
        leaf.x += leaf.speedX;
        leaf.y += leaf.speedY;
        leaf.rot += leaf.rotSpeed;
        if (leaf.x > this.camera.width + 30) leaf.x = -30;
        if (leaf.y > this.camera.height + 30) leaf.y = -30;
      });
    }

    // Roaming Pips idle wander
    const time = Date.now() * 0.001;
    this.roamingPips.forEach((rp, idx) => {
      rp.x = rp.origX + Math.sin(time + idx) * rp.wander * 8;
      rp.y = rp.origY + Math.cos(time * 0.8 + idx) * rp.wander * 6;
    });

    // Center camera on player (clamped)
    const targetCamX = p.x + p.w / 2 - this.camera.width / 2;
    const targetCamY = p.y + p.h / 2 - this.camera.height / 2;
    const maxCamX = this.mapCols * this.tileSize - this.camera.width;
    const maxCamY = this.mapRows * this.tileSize - this.camera.height;

    this.camera.x = Math.max(0, Math.min(maxCamX, targetCamX));
    this.camera.y = Math.max(0, Math.min(maxCamY, targetCamY));
  }

  checkSolidCollision(px, py) {
    const pad = 3;
    const left = Math.floor((px + pad) / this.tileSize);
    const right = Math.floor((px + this.player.w - pad) / this.tileSize);
    const top = Math.floor((py + 10) / this.tileSize); // allow walking close to top
    const bottom = Math.floor((py + this.player.h - 1) / this.tileSize);

    const solidTypes = [1, 2, 9]; // Wall, Desk, Trees/Monoliths. Water (6) and Sand (10) are walkable/swimmable!
    for (let r = top; r <= bottom; r++) {
      for (let c = left; c <= right; c++) {
        if (!this.tiles[r] || solidTypes.includes(this.tiles[r][c])) {
          return true;
        }
      }
    }
    return false;
  }

  updateCurrentZoneName(c, r) {
    const pill = document.getElementById('ow-zone-pill');
    if (!pill) return;
    let zone = 'Route 1: Verdant Meadow';
    if (c <= 26 && r <= 22) zone = 'Archivist Sanctuary';
    else if (c >= 27 && c <= 46 && r >= 20 && r <= 28) zone = 'Central Crossroads';
    else if (c <= 37 && r >= 26) zone = 'Route 2: Whispering Lake';
    else if (c >= 38 && r >= 26) zone = 'Route 3: Obsidian Glitchlands';
    else if (c >= 27 && r <= 25) zone = 'Route 1: Verdant Meadow';

    pill.innerHTML = `<span>${zone}</span>`;
  }

  drawOverworld() {
    const ctx = this.owCtx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.camera.width, this.camera.height);
    const cx = Math.floor(this.camera.x);
    const cy = Math.floor(this.camera.y);

    const startCol = Math.floor(cx / this.tileSize);
    const endCol = Math.min(this.mapCols - 1, startCol + Math.ceil(this.camera.width / this.tileSize) + 1);
    const startRow = Math.floor(cy / this.tileSize);
    const endRow = Math.min(this.mapRows - 1, startRow + Math.ceil(this.camera.height / this.tileSize) + 1);

    // 1. Draw Map Tiles
    const time = Date.now() * 0.003;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const t = this.tiles[r][c];
        const tx = c * this.tileSize - cx;
        const ty = r * this.tileSize - cy;

        if (t === 0) {
          // Lab Parquet Floor
          ctx.fillStyle = (r + c) % 2 === 0 ? '#d4b996' : '#c9aa83';
          ctx.fillRect(tx, ty, this.tileSize, this.tileSize);
          ctx.strokeStyle = 'rgba(100, 70, 40, 0.15)';
          ctx.strokeRect(tx, ty, this.tileSize, this.tileSize);
        } else if (t === 1) {
          // Lab Wall
          ctx.fillStyle = '#475569';
          ctx.fillRect(tx, ty, this.tileSize, this.tileSize);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(tx, ty, this.tileSize, 8);
        } else if (t === 2) {
          // Lab Desk / PC terminal / Bookshelf
          ctx.fillStyle = '#334155';
          ctx.fillRect(tx, ty, this.tileSize, this.tileSize);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(tx + 6, ty + 6, 20, 14); // Glowing terminal screen
        } else if (t === 3) {
          // Cobble / Dirt Path
          ctx.fillStyle = '#e2d4b7';
          ctx.fillRect(tx, ty, this.tileSize, this.tileSize);
          ctx.fillStyle = '#d3c3a1';
          ctx.fillRect(tx + 4, ty + 4, 8, 8);
          ctx.fillRect(tx + 18, ty + 16, 6, 6);
        } else if (t === 4) {
          // Green Meadow Grass
          ctx.fillStyle = '#65a30d';
          ctx.fillRect(tx, ty, this.tileSize, this.tileSize);
          // Little flower dot
          if ((r * 7 + c * 13) % 9 === 0) {
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(tx + 14, ty + 12, 4, 4);
          }
        } else if (t === 5) {
          // Tall Wild Grass
          ctx.fillStyle = '#3f6212';
          ctx.fillRect(tx, ty, this.tileSize, this.tileSize);
          // Animated rustling stalks
          const sway = Math.sin(time + c) * 2;
          ctx.fillStyle = '#84cc16';
          ctx.fillRect(tx + 4 + sway, ty + 6, 3, 20);
          ctx.fillRect(tx + 14 - sway, ty + 4, 3, 22);
          ctx.fillRect(tx + 24 + sway, ty + 8, 3, 18);
        } else if (t === 6) {
          // Deep Animated Water
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(tx, ty, this.tileSize, this.tileSize);
          const wave = Math.sin(time + r + c) * 3;
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(tx + 4, ty + 12 + wave, 14, 2);
          ctx.fillRect(tx + 16, ty + 22 - wave, 12, 2);
        } else if (t === 7) {
          // Wooden Bridge
          ctx.fillStyle = '#92400e';
          ctx.fillRect(tx, ty, this.tileSize, this.tileSize);
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx, ty, this.tileSize, this.tileSize);
        } else if (t === 8) {
          // Cyber Matrix Floor
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(tx, ty, this.tileSize, this.tileSize);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx + 2, ty + 2, 28, 28);
          // Neon glow circuit trace
          if ((r + c) % 3 === 0) {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(tx + 14, ty + 14, 4, 4);
          }
        } else if (t === 9) {
          // Border Trees / Cyber Pillars
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(tx, ty, this.tileSize, this.tileSize);
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.arc(tx + 16, ty + 16, 14, 0, Math.PI * 2);
          ctx.fill();
        } else if (t === 10) {
          // Golden Sand Beach Shore
          ctx.fillStyle = (r + c) % 2 === 0 ? '#f7dc9f' : '#edd08d';
          ctx.fillRect(tx, ty, this.tileSize, this.tileSize);
          if ((r * 11 + c * 17) % 5 === 0) {
            ctx.fillStyle = '#dfbe75';
            ctx.fillRect(tx + 6, ty + 8, 3, 3);
            ctx.fillRect(tx + 20, ty + 18, 3, 3);
          }
        }
      }
    }

    // 2. Draw Interactive Objects & Ground Items
    this.interactives.forEach(obj => {
      const ox = obj.x - cx;
      const oy = obj.y - cy;
      if (ox < -32 || ox > this.camera.width || oy < -32 || oy > this.camera.height) return;

      if (obj.type === 'heal') {
        // Nurse Bar
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(ox + 4, oy + 4, 24, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HP', ox + 16, oy + 20);
      } else if (obj.type === 'sign') {
        // Wooden Signpost
        ctx.fillStyle = '#78350f';
        ctx.fillRect(ox + 13, oy + 16, 6, 14);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(ox + 4, oy + 4, 24, 14);
        ctx.strokeStyle = '#451a03';
        ctx.strokeRect(ox + 4, oy + 4, 24, 14);
      } else if (obj.type === 'item' && !obj.collected) {
        // Ground Pokeball / Pip-Capsule Item
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ox + 16, oy + 16, 8, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ox + 16, oy + 16, 8, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(ox + 16, oy + 16, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 3. Draw NPCs with unique styling and floating prompt
    this.npcs.forEach(npc => {
      const nx = npc.x - cx;
      const ny = npc.y - cy;
      if (nx < -40 || nx > this.camera.width + 10 || ny < -40 || ny > this.camera.height + 10) return;

      const pDist = Math.hypot((this.player.x + 16) - (npc.x + 16), (this.player.y + 16) - (npc.y + 16));

      // Little shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(nx + 16, ny + 29, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // NPC Body
      ctx.fillStyle = npc.color;
      ctx.fillRect(nx + 8, ny + 11, 16, 17);

      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(nx + 16, ny + 8, 7, 0, Math.PI * 2);
      ctx.fill();

      // Hat / Hair accessory
      ctx.fillStyle = npc.hatColor || '#1e293b';
      ctx.beginPath();
      ctx.arc(nx + 16, ny + 6, 7, Math.PI, Math.PI * 2);
      ctx.fill();

      // Floating interactive bubble when player is within 56px!
      if (pDist < 56) {
        const bounce = Math.sin(Date.now() / 160) * 3;
        const bubbleY = ny - 16 + bounce;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;

        // Pill speech bubble
        ctx.beginPath();
        ctx.roundRect(nx + 2, bubbleY, 28, 14, 4);
        ctx.fill();
        ctx.stroke();

        // Speech tail
        ctx.beginPath();
        ctx.moveTo(nx + 13, bubbleY + 14);
        ctx.lineTo(nx + 16, bubbleY + 18);
        ctx.lineTo(nx + 19, bubbleY + 14);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('[E] TALK', nx + 16, bubbleY + 7);
      }
    });

    // 3.5 Draw 5 Official Regional Gym Leaders
    this.gymLeaders.forEach(gym => {
      const gx = gym.x - cx;
      const gy = gym.y - cy;
      if (gx < -48 || gx > this.camera.width + 16 || gy < -48 || gy > this.camera.height + 16) return;

      const pDist = Math.hypot((this.player.x + 16) - (gym.x + 16), (this.player.y + 16) - (gym.y + 16));

      // Arena Podium Platform underneath Leader
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.beginPath();
      ctx.ellipse(gx + 16, gy + 30, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = gym.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(gx + 16, gy + 28, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (Cape / Uniform)
      ctx.fillStyle = gym.color;
      ctx.fillRect(gx + 7, gy + 10, 18, 18);

      // Accent gold stripe
      ctx.fillStyle = '#fde047';
      ctx.fillRect(gx + 14, gy + 10, 4, 18);

      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(gx + 16, gy + 7, 7, 0, Math.PI * 2);
      ctx.fill();

      // Hat / Hair
      ctx.fillStyle = gym.hatColor || '#0f172a';
      ctx.beginPath();
      ctx.arc(gx + 16, gy + 5, 7.5, Math.PI, Math.PI * 2);
      ctx.fill();

      // Proximity Action Prompt
      if (pDist < 56) {
        const bounce = Math.sin(Date.now() / 160) * 3;
        const bubbleY = gy - 20 + bounce;

        ctx.fillStyle = gym.defeated ? '#f0fdf4' : '#fffbeb';
        ctx.strokeStyle = gym.defeated ? '#16a34a' : '#d97706';
        ctx.lineWidth = 1.5;

        const promptText = gym.defeated ? `[E] ${gym.name} (CLEARED)` : `[E] GYM BATTLE: ${gym.badge}`;
        ctx.font = 'bold 8px monospace';
        const textWidth = ctx.measureText(promptText).width;
        const bubbleW = Math.max(76, textWidth + 12);

        ctx.beginPath();
        ctx.roundRect(gx + 16 - bubbleW / 2, bubbleY, bubbleW, 15, 4);
        ctx.fill();
        ctx.stroke();

        // Speech tail
        ctx.beginPath();
        ctx.moveTo(gx + 13, bubbleY + 15);
        ctx.lineTo(gx + 16, bubbleY + 19);
        ctx.lineTo(gx + 19, bubbleY + 15);
        ctx.fillStyle = gym.defeated ? '#f0fdf4' : '#fffbeb';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = gym.defeated ? '#15803d' : '#9a3412';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(promptText, gx + 16, bubbleY + 8);
      }
    });

    // 4. Draw Roaming Wild Pips (Mini Sprites in Overworld!)
    this.roamingPips.forEach(rp => {
      if (!rp.active) return;
      const rx = rp.x - cx;
      const ry = rp.y - cy;
      if (rx < -32 || rx > this.camera.width || ry < -32 || ry > this.camera.height) return;

      // Cute colored wild creature orb with eyes
      const data = this.speciesData[rp.species];
      ctx.save();
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(rx + 16, ry + 26, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Floating body
      const floatY = ry + Math.sin(time * 3 + rp.origX) * 3;
      if (rp.species === 'flamechar') ctx.fillStyle = '#ea580c';
      else if (rp.species === 'bulbasprout') ctx.fillStyle = '#16a34a';
      else if (rp.species === 'buggypip') ctx.fillStyle = '#9333ea';
      else if (rp.species === 'aquabyte') ctx.fillStyle = '#0284c7';
      else if (rp.species === 'voltasync') ctx.fillStyle = '#eab308';
      else ctx.fillStyle = '#ec4899';

      ctx.beginPath();
      ctx.arc(rx + 16, floatY + 14, 11, 0, Math.PI * 2);
      ctx.fill();

      // Cute big anime eyes
      ctx.fillStyle = '#fff';
      ctx.fillRect(rx + 11, floatY + 11, 3, 5);
      ctx.fillRect(rx + 18, floatY + 11, 3, 5);
      ctx.fillStyle = '#000';
      ctx.fillRect(rx + 12, floatY + 13, 2, 3);
      ctx.fillRect(rx + 19, floatY + 13, 2, 3);

      // Alert bubble "!" when trainer approaches within 56px
      const distToTrainer = Math.hypot((this.player.x + this.player.w / 2) - (rp.x + 16), (this.player.y + this.player.h / 2) - (rp.y + 16));
      if (distToTrainer < 56) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(rx + 16, floatY - 4, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', rx + 16, floatY - 1);
      }
      ctx.restore();
    });

    // 5. Draw Dust & Grass Particles
    ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
    this.player.dustParticles.forEach(dp => {
      ctx.beginPath();
      ctx.arc(dp.x - cx, dp.y - cy, dp.r, 0, Math.PI * 2);
      ctx.fill();
    });
    this.player.grassParticles.forEach(gp => {
      ctx.fillStyle = gp.color;
      ctx.globalAlpha = Math.max(0, gp.life);
      ctx.fillRect(gp.x - cx, gp.y - cy, 3, 3);
    });
    ctx.globalAlpha = 1.0;

    // 5.5 Draw HeartGold Following Partner Pokémon
    this.drawFollowingPokemon(ctx, cx, cy, time);

    // 6. Draw Player Trainer (Using Image 2 Sprite - Auburn Hair, Brown Cap, Pink Top, White Skirt)
    const p = this.player;
    const px = Math.floor(p.x - cx);
    const py = Math.floor(p.y - cy);
    const pTileCol = Math.floor((p.x + p.w / 2) / this.tileSize);
    const pTileRow = Math.floor((p.y + p.h / 2) / this.tileSize);
    const isWater = (this.tiles[pTileRow] && this.tiles[pTileRow][pTileCol] === 6);
    this.drawTrainerDeepshikha(ctx, px, py, p.dir, p.animFrame, p.isMoving, isWater);

    // Tall Grass Overlay over Player's feet when inside grass (classic Pokemon immersion!)
    if (!isWater && this.tiles[pTileRow] && this.tiles[pTileRow][pTileCol] === 5) {
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(px + 2, py + 22, 20, 6);
    }

    // 7. Draw Floating HGSS Autumn Leaves / Wind Particles
    this.drawWindLeaves(ctx);

    // 8. Draw Radar Minimap on Top-Left Canvas
    this.drawMinimap();
  }

  drawTrainerDeepshikha(ctx, px, py, dir, animFrame, isMoving, isWater = false) {
    const bob = isMoving ? (animFrame % 2 === 0 ? 1 : -1) : 0;
    const drawW = 24;
    const drawH = 36;
    const drawX = px;
    const drawY = py - 8 + bob;

    // 1. Water Swimming Ripples vs Ground Shadow
    if (isWater) {
      ctx.save();
      const wavePulse = Math.sin(Date.now() * 0.006) * 1.5;
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(px + 12, py + 24, 13 + wavePulse, 5 + wavePulse * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(px + 12, py + 26, 17, 6.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(px + 12, py + 28, 9, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw Sprite with Full Walking Animation (4 Directions x 4 Walking Frames)
    if (this.playerSpriteSheet && this.playerSpriteSheet.complete && this.playerSpriteSheet.naturalWidth > 0) {
      const sw = 73;
      const sh = 113;
      const col = isMoving ? (animFrame % 4) : 0;
      let row = 0; // 0: Down (Facing South)
      if (dir === 1) row = 1; // 1: Up (Facing North / Back View)
      else if (dir === 2 || dir === 3) row = 2; // 2: Side Profile

      const sx = col * sw;
      const sy = row * sh;

      ctx.save();
      ctx.imageSmoothingEnabled = false; // preserve crisp pixel art
      if (dir === 2) {
        // Facing Left: horizontal flip of side walk cycle
        ctx.translate(px + 12, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.playerSpriteSheet, sx, sy, sw, sh, -12, drawY, drawW, drawH);
      } else {
        // Facing Right / Down / Up
        ctx.drawImage(this.playerSpriteSheet, sx, sy, sw, sh, drawX, drawY, drawW, drawH);
      }
      ctx.restore();

      // Translucent water wash over submerged legs when swimming in water
      if (isWater) {
        ctx.fillStyle = 'rgba(2, 132, 199, 0.45)';
        ctx.fillRect(px + 2, py + 18, 20, 10);
      }
      return;
    }

    // Fallback if spritesheet is loading: single image fallback
    if (this.playerSpriteImg && this.playerSpriteImg.complete && this.playerSpriteImg.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (dir === 2) {
        ctx.translate(px + 12, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.playerSpriteImg, -12, drawY, drawW, drawH);
      } else {
        ctx.drawImage(this.playerSpriteImg, drawX, drawY, drawW, drawH);
      }
      ctx.restore();

      if (isWater) {
        ctx.fillStyle = 'rgba(2, 132, 199, 0.45)';
        ctx.fillRect(px + 2, py + 18, 20, 10);
      }
      return;
    }

    // Procedural Fallback if image still loading (Image 2 Colors)
    ctx.fillStyle = '#9a3412'; // Brown cap
    ctx.fillRect(px + 6, py - 6 + bob, 12, 5);
    ctx.fillStyle = '#78350f'; // Auburn hair
    ctx.fillRect(px + 4, py - 2 + bob, 16, 10);
    ctx.fillStyle = '#fed7aa'; // Face
    ctx.fillRect(px + 7, py - 1 + bob, 10, 7);
    ctx.fillStyle = '#1e293b'; // Eyes
    ctx.fillRect(px + 9, py + 1 + bob, 2, 2);
    ctx.fillRect(px + 13, py + 1 + bob, 2, 2);
    ctx.fillStyle = '#f472b6'; // Pink blouse / top
    ctx.fillRect(px + 5, py + 7 + bob, 14, 8);
    ctx.fillStyle = '#ffffff'; // White skirt
    ctx.fillRect(px + 6, py + 15 + bob, 12, 5);
    if (!isWater) {
      ctx.fillStyle = '#78350f'; // Brown boots
      ctx.fillRect(px + 7, py + 20 + bob, 4, 6);
      ctx.fillRect(px + 13, py + 20 + bob, 4, 6);
    }
  }

  drawFollowingPokemon(ctx, cx, cy, time) {
    if (!this.partner) return;
    const k = this.activePokemonKey || 'flamechar';
    const poke = this.speciesData[k];
    if (!poke) return;

    const px = Math.floor(this.partner.x - cx);
    const py = Math.floor(this.partner.y - cy);
    if (px < -32 || px > this.camera.width || py < -32 || py > this.camera.height) return;

    const bob = (this.player.isMoving ? Math.sin(time * 8) * 2 : 0);

    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px + 12, py + 24, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specific mini-sprite based on species
    if (k === 'flamechar') {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(px + 12, py + 14 + bob, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px + 9, py + 14 + bob, 6, 6);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 9, py + 11 + bob, 2, 3);
      ctx.fillRect(px + 13, py + 11 + bob, 2, 3);
      // Flame tail
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(px + 4, py + 12 + bob + Math.sin(time * 12) * 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(px + 4, py + 12 + bob + Math.sin(time * 12) * 2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (k === 'bulbasprout') {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(px + 5, py + 12 + bob, 14, 10);
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(px + 12, py + 8 + bob, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(px + 12, py + 7 + bob, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px + 7, py + 13 + bob, 2, 3);
      ctx.fillRect(px + 15, py + 13 + bob, 2, 3);
    } else if (k === 'aquabyte') {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(px + 12, py + 14 + bob, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px + 6, py + 11 + bob, 5, 8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 10, py + 12 + bob, 2, 3);
      ctx.fillRect(px + 14, py + 12 + bob, 2, 3);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 3, py + 16 + bob, 3, 3);
    } else if (k === 'sparkpip') {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(px + 12, py + 14 + bob, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(px + 7, py + 5 + bob, 2, 4);
      ctx.fillRect(px + 15, py + 5 + bob, 2, 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 7, py + 3 + bob, 2, 2);
      ctx.fillRect(px + 15, py + 3 + bob, 2, 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px + 7, py + 15 + bob, 2, 2);
      ctx.fillRect(px + 15, py + 15 + bob, 2, 2);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(px + 3, py + 10 + bob, 3, 5);
    } else {
      ctx.fillStyle = poke.type1 === 'GHOST' ? '#7e22ce' : poke.type1 === 'FAIRY' ? '#f472b6' : '#eab308';
      ctx.beginPath();
      ctx.arc(px + 12, py + 14 + bob, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 9, py + 12 + bob, 2, 3);
      ctx.fillRect(px + 13, py + 12 + bob, 2, 3);
    }

    // Little Sparkle of Partner Bond
    if (Math.sin(time * 2) > 0.8) {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(px + 18, py + 5 + bob, 3, 3);
    }

    ctx.restore();
  }

  drawWindLeaves(ctx) {
    if (!this.windLeaves) return;
    this.windLeaves.forEach(leaf => {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rot);
      ctx.fillStyle = leaf.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size, leaf.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawMinimap() {
    if (!this.minimapCanvas) {
      this.minimapCanvas = document.getElementById('pip-minimap-canvas');
      if (this.minimapCanvas) this.minimapCtx = this.minimapCanvas.getContext('2d');
    }
    const ctx = this.minimapCtx;
    if (!ctx) return;

    if (!this.minimapBg) {
      this.buildMinimapCache();
    }

    // 1. Draw cached map background
    ctx.drawImage(this.minimapBg, 0, 0);

    const scaleX = 120 / (this.mapCols * this.tileSize);
    const scaleY = 90 / (this.mapRows * this.tileSize);

    // 2. Draw Camera Viewport Box (where player is looking)
    const camX = this.camera.x * scaleX;
    const camY = this.camera.y * scaleY;
    const camW = this.camera.width * scaleX;
    const camH = this.camera.height * scaleY;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1;
    ctx.strokeRect(camX, camY, camW, camH);

    // 3. Draw 5 Gym Leaders (blips)
    const time = Date.now() / 250;
    const pulse = Math.sin(time) * 1.2;
    this.gymLeaders.forEach(gym => {
      const gx = (gym.x + 16) * scaleX;
      const gy = (gym.y + 16) * scaleY;

      ctx.save();
      if (gym.defeated) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = gym.color;
        ctx.beginPath();
        ctx.arc(gx, gy, Math.max(2, 3.2 + pulse), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();
    });

    // 4. Draw Player Blip (Bright Gold Dot)
    const px = (this.player.x + 16) * scaleX;
    const py = (this.player.y + 16) * scaleY;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(px, py, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  startGymBattle(leader) {
    this.currentGymLeader = leader;
    this.startBattle(leader.signatureSpecies, { isGym: true, leader });
  }

  handleActionPress() {
    if (this.dialogueActive) {
      this.closeDialogue();
      return;
    }

    // Check entity in front of player or in immediate proximity
    const p = this.player;
    const pxCenter = p.x + p.w / 2;
    const pyCenter = p.y + p.h / 2;
    let checkX = pxCenter;
    let checkY = pyCenter;
    const reach = 32;

    if (p.dir === 0) checkY += reach;
    else if (p.dir === 1) checkY -= reach;
    else if (p.dir === 2) checkX -= reach;
    else if (p.dir === 3) checkX += reach;

    // Check Gym Leader challenge interaction
    for (const gym of this.gymLeaders) {
      const dirDist = Math.hypot(checkX - (gym.x + 16), checkY - (gym.y + 16));
      const proxDist = Math.hypot(pxCenter - (gym.x + 16), pyCenter - (gym.y + 16));
      if (dirDist < 46 || proxDist < 46) {
        sfx.playClick();
        if (gym.defeated) {
          this.showDialogue(gym.name, gym.victorySpeech || `You already conquered the ${gym.gymName}! Safe travels!`);
        } else {
          this.showDialogue(gym.name, gym.challengeSpeech, () => this.startGymBattle(gym));
        }
        return;
      }
    }

    // Check NPC interaction: both directional check AND proximity check (< 46px)
    for (const npc of this.npcs) {
      const dirDist = Math.hypot(checkX - (npc.x + 16), checkY - (npc.y + 16));
      const proxDist = Math.hypot(pxCenter - (npc.x + 16), pyCenter - (npc.y + 16));
      if (dirDist < 46 || proxDist < 46) {
        sfx.playClick();
        if (npc.action) {
          npc.action();
        } else {
          const msg = npc.dialogues ? npc.dialogues[npc.dialogueIndex % npc.dialogues.length] : (npc.dialogue || "Safe travels, Trainer!");
          if (npc.dialogues) npc.dialogueIndex++;
          this.showDialogue(npc.name, msg);
        }
        return;
      }
    }

    // Check Partner Pokémon Interaction (HGSS Feature!)
    if (this.partner) {
      const distToPartner = Math.hypot(pxCenter - (this.partner.x + 12), pyCenter - (this.partner.y + 12));
      const dirDistPartner = Math.hypot(checkX - (this.partner.x + 12), checkY - (this.partner.y + 12));
      if (distToPartner < 38 || dirDistPartner < 38) {
        sfx.playBlip();
        const k = this.activePokemonKey || 'flamechar';
        const poke = this.speciesData[k];
        const dialogues = [
          `${poke.name} looked up happily at DEEPSHIKHA! It seems full of energy!`,
          `${poke.name} is walking briskly alongside DEEPSHIKHA, matching her footsteps!`,
          `${poke.name} rubbed gently against DEEPSHIKHA! Its bond with its Trainer grows stronger!`,
          `${poke.name} looked around the route curiously, ready for whatever adventure comes next!`
        ];
        const quote = dialogues[Math.floor(Math.random() * dialogues.length)];
        this.showDialogue(`PARTNER ${poke.name}`, quote);
        return;
      }
    }

    // Check Interactive Objects
    for (const obj of this.interactives) {
      const dirDist = Math.hypot(checkX - (obj.x + 16), checkY - (obj.y + 16));
      const proxDist = Math.hypot(pxCenter - (obj.x + 16), pyCenter - (obj.y + 16));
      if (dirDist < 46 || proxDist < 46) {
        sfx.playClick();
        if (obj.action) obj.action();
        else if (obj.type === 'sign') this.showDialogue('SIGNPOST', obj.text);
        else if (obj.type === 'item' && !obj.collected) {
          obj.collected = true;
          sfx.playItemChime();
          obj.grant();
        }
        return;
      }
    }
  }

  healTrainer() {
    sfx.playHeal();
    this.player.hp = this.player.maxHp;
    this.updateHUD();
    const nurse = this.npcs.find(n => n.id === 'nurse_chai');
    let msg = "Welcome to the Oasis Waystation! Fresh celestial herbal tea is brewed! All your HP was restored to 100%!";
    if (nurse && nurse.dialogues) {
      msg = nurse.dialogues[nurse.dialogueIndex % nurse.dialogues.length];
      nurse.dialogueIndex++;
    }
    this.showDialogue('NURSE CHAI (OASIS HUB)', msg);
  }

  showDialogue(speaker, message, onClose = null) {
    this.dialogueActive = true;
    this.onDialogueClose = onClose;
    const box = document.getElementById('ow-dialogue-box');
    const spkEl = document.getElementById('ow-dialogue-speaker');
    const msgEl = document.getElementById('ow-dialogue-message');

    if (box && spkEl && msgEl) {
      spkEl.textContent = speaker;
      msgEl.textContent = message;
      box.style.display = 'flex';
      sfx.playBlip();
    }
  }

  closeDialogue() {
    this.dialogueActive = false;
    const box = document.getElementById('ow-dialogue-box');
    if (box) box.style.display = 'none';
    if (this.onDialogueClose) {
      const cb = this.onDialogueClose;
      this.onDialogueClose = null;
      cb();
    }
  }

  updateHUD() {
    const hpEl = document.getElementById('ow-hp-count');
    const dexEl = document.getElementById('ow-dex-count');
    const dexNav = document.getElementById('dex-nav-count');
    const gymEl = document.getElementById('ow-gyms-count');

    let count = 0;
    Object.keys(this.dex).forEach(k => { if (this.dex[k]) count++; });

    let defeatedGyms = 0;
    if (this.gymLeaders) {
      defeatedGyms = this.gymLeaders.filter(g => g.defeated).length;
    }

    if (hpEl) hpEl.textContent = `${this.player.hp}/${this.player.maxHp}`;
    if (dexEl) dexEl.textContent = `${count}/${Object.keys(this.dex).length}`;
    if (dexNav) dexNav.textContent = count;
    if (gymEl) gymEl.textContent = `${defeatedGyms}/5`;

    // Update Badges on Trainer Card
    ['ember', 'flora', 'tide', 'pulse', 'cipher'].forEach(bKey => {
      const bEl = document.getElementById(`badge-${bKey}`);
      if (bEl) {
        if (this.badges && this.badges[bKey]) {
          bEl.classList.add('active');
        } else {
          bEl.classList.remove('active');
        }
      }
    });
  }

  // ========================================================
  // BATTLE TRANSITION & TURN-BASED ARENA ENGINE
  // ========================================================
  triggerWildEncounter(speciesKey) {
    if (!speciesKey) {
      const keys = Object.keys(this.speciesData);
      speciesKey = keys[Math.floor(Math.random() * keys.length)];
    }
    sfx.playEncounter();
    const flash = document.getElementById('ow-flash-overlay');
    if (flash) {
      flash.classList.add('flashing');
      setTimeout(() => flash.classList.remove('flashing'), 600);
    }

    setTimeout(() => {
      this.startBattle(speciesKey);
    }, 450);
  }

  startBattle(speciesKey, options = {}) {
    if (!speciesKey) {
      const keys = Object.keys(this.speciesData);
      speciesKey = keys[Math.floor(Math.random() * keys.length)];
    }
    this.currentSpeciesKey = speciesKey;
    this.currentBattleContext = options;
    const data = this.speciesData[speciesKey] || this.speciesData.flamechar;
    this.pip = { ...data };
    this.isRefactored = false;
    this.isTamed = false;

    this.setMode('battle');

    // Populate Enemy UI
    const nameEl = document.getElementById('enemy-pip-name');
    const b1 = document.getElementById('enemy-type-badge-1');
    const b2 = document.getElementById('enemy-type-badge-2');
    const statusTag = document.getElementById('enemy-status-tag');
    const balloon = document.getElementById('enemy-speech-balloon');
    const mascotImg = document.getElementById('enemy-mascot-img');

    if (nameEl) {
      nameEl.textContent = options.isGym ? `${options.leader.name}'S ${this.pip.name}` : this.pip.name;
    }
    if (b1) {
      b1.textContent = this.pip.type1;
      b1.className = `psc-badge ${this.pip.badgeClass}`;
    }
    if (b2) b2.textContent = this.pip.type2;
    if (statusTag) {
      if (options.isGym) {
        statusTag.textContent = `GYM LEADER: ${options.leader.badge}`;
        statusTag.style.backgroundColor = '#fbbf24';
      } else {
        statusTag.textContent = this.dex[speciesKey] ? 'CAUGHT' : 'WILD';
        statusTag.style.backgroundColor = this.dex[speciesKey] ? '#a3e635' : '#fef08a';
      }
    }
    if (balloon) {
      const greeting = options.isGym ? `Face my ${this.pip.name}! Prove your worth!` : `"${this.pip.greeting}"`;
      balloon.innerHTML = `<span>${greeting}</span>`;
      balloon.style.opacity = '1';
      balloon.style.display = 'block';
      if (this.balloonTimer) clearTimeout(this.balloonTimer);
      this.balloonTimer = setTimeout(() => {
        balloon.style.transition = 'opacity 0.5s ease-out';
        balloon.style.opacity = '0';
        setTimeout(() => {
          balloon.style.display = 'none';
        }, 500);
      }, 4000);
    }
    if (mascotImg && this.pip.spriteSrc) {
      mascotImg.src = this.pip.spriteSrc;
      mascotImg.alt = this.pip.name;
    }

    // Populate Player Active Pokémon UI
    const activeData = this.speciesData[this.activePokemonKey] || this.speciesData.flamechar;
    const pNameEl = document.getElementById('player-battle-name');
    const pType1 = document.getElementById('player-type-badge-1');
    const pType2 = document.getElementById('player-type-badge-2');
    const pPartnerImg = document.getElementById('player-partner-img');

    if (pNameEl) pNameEl.textContent = activeData.name;
    if (pType1) {
      pType1.textContent = activeData.type1;
      pType1.className = `psc-badge ${activeData.badgeClass || 'type-trainer'}`;
    }
    if (pType2) pType2.textContent = activeData.type2 || 'PARTNER';
    if (pPartnerImg) {
      pPartnerImg.src = activeData.spriteSrc;
      pPartnerImg.alt = activeData.name;
    }

    this.updateHpUI();
    const introMsg = options.isGym
      ? `Gym Leader ${options.leader.name} sent out ${this.pip.name}! Go, ${activeData.name}! What will ${activeData.name} do?`
      : `Wild ${this.pip.name} appeared! Go, ${activeData.name}! What will ${activeData.name} do?`;
    this.typeDialogue(introMsg);
  }

  typeDialogue(text, callback) {
    const el = document.getElementById('pip-dialogue-text');
    if (!el) return;
    if (this.dialogueTimer) {
      clearInterval(this.dialogueTimer);
      this.dialogueTimer = null;
    }
    this.currentDialogueText = text;
    this.currentDialogueCb = callback;
    el.textContent = '';
    let i = 0;
    this.dialogueTimer = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        if (i % 3 === 0 && text[i] !== ' ') sfx.playBlip();
        i++;
      } else {
        clearInterval(this.dialogueTimer);
        this.dialogueTimer = null;
        const cb = this.currentDialogueCb;
        this.currentDialogueCb = null;
        if (cb) cb();
      }
    }, 20);
  }

  finishDialogueInstantly() {
    if (this.dialogueTimer) {
      clearInterval(this.dialogueTimer);
      this.dialogueTimer = null;
      const el = document.getElementById('pip-dialogue-text');
      if (el && this.currentDialogueText) {
        el.textContent = this.currentDialogueText;
      }
      const cb = this.currentDialogueCb;
      this.currentDialogueCb = null;
      if (cb) cb();
    }
  }

  escapeBattle() {
    if (this.mode !== 'battle') return;
    sfx.playClick();
    this.closeSubmenu();
    this.graceSteps = 10;
    this.grassStepCount = 0;
    this.typeDialogue('Got away safely!', () => {
      setTimeout(() => this.setMode('overworld'), 500);
    });
  }

  toggleFullscreen() {
    const gameView = document.getElementById('game-view');
    if (!gameView) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (gameView.requestFullscreen) {
        gameView.requestFullscreen().catch(() => {});
      } else if (gameView.webkitRequestFullscreen) {
        gameView.webkitRequestFullscreen();
      } else if (gameView.msRequestFullscreen) {
        gameView.msRequestFullscreen();
      }
      gameView.classList.add('fullscreen-mode');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      gameView.classList.remove('fullscreen-mode');
    }
  }

  updateHpUI() {
    const eFill = document.getElementById('enemy-hp-fill');
    const eText = document.getElementById('enemy-hp-text');
    if (eFill && eText && this.pip) {
      const pct = Math.max(0, Math.min(100, (this.pip.hp / this.pip.maxHp) * 100));
      eFill.style.width = `${pct}%`;
      eFill.style.backgroundColor = pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444';
      eText.textContent = `${this.pip.hp} / ${this.pip.maxHp}`;
    }

    const pFill = document.getElementById('player-hp-fill');
    const pText = document.getElementById('player-hp-text');
    if (pFill && pText) {
      const pct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
      pFill.style.width = `${pct}%`;
      pFill.style.backgroundColor = pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444';
      pText.textContent = `${this.player.hp} / ${this.player.maxHp}`;
    }

    this.updateHUD();
  }

  openSubmenu(category) {
    sfx.playClick();
    const panel = document.getElementById('pip-submenu-panel');
    const title = document.getElementById('submenu-title');
    const grid = document.getElementById('submenu-options-grid');
    if (!panel || !grid) return;

    grid.innerHTML = '';
    panel.style.display = 'block';

    const activeData = this.speciesData[this.activePokemonKey] || this.speciesData.flamechar;

    if (category === 'fight') {
      title.textContent = `CHOOSE ${activeData.name}'S ATTACK:`;
      const currentMoves = activeData.moves || [
        { name: 'Tackle', type: 'NORMAL', dmg: 35, desc: 'A physical tackle' }
      ];
      currentMoves.forEach(m => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item-btn';
        btn.innerHTML = `<span class="sub-item-name">${m.name}</span><span class="sub-item-meta">[${m.type}] ${m.desc} (${m.dmg} DMG)</span>`;
        btn.addEventListener('click', () => this.executeAttack(m));
        grid.appendChild(btn);
      });
    } else if (category === 'act' || category === 'pokemon') {
      title.textContent = 'POKÉMON TEAM (SELECT TO BATTLE / SWITCH):';
      const teamKeys = [...new Set([...this.playerTeam, ...Object.keys(this.dex).filter(k => this.dex[k])])];
      teamKeys.forEach(key => {
        const poke = this.speciesData[key];
        if (!poke) return;
        const isActive = (key === this.activePokemonKey);
        const btn = document.createElement('button');
        btn.className = `submenu-item-btn pokemon-team-btn ${isActive ? 'active-team-member' : ''}`;
        btn.innerHTML = `
          <div class="sub-pkmn-row">
            <img src="${poke.spriteSrc}" alt="${poke.name}" class="sub-pkmn-thumb">
            <div class="sub-pkmn-info">
              <span class="sub-item-name">${poke.name} :L${poke.level} ${isActive ? '[ACTIVE]' : ''}</span>
              <span class="sub-item-meta">[${poke.type1}/${poke.type2}] Moves: ${poke.moves.map(m => m.name).join(', ')}</span>
            </div>
            <span class="sub-pkmn-action">${isActive ? 'IN ARENA' : 'SWITCH IN'}</span>
          </div>
        `;
        btn.addEventListener('click', () => this.switchBattlePokemon(key));
        grid.appendChild(btn);
      });

      // Special trainer actions
      const inspectBtn = document.createElement('button');
      inspectBtn.className = 'submenu-item-btn';
      inspectBtn.innerHTML = `<span class="sub-item-name">Inspect Wild ${this.pip.name}</span>`;
      inspectBtn.addEventListener('click', () => this.typeDialogue(this.pip.inspect, () => this.closeSubmenu()));
      grid.appendChild(inspectBtn);

      const chaiBtn = document.createElement('button');
      chaiBtn.className = 'submenu-item-btn';
      chaiBtn.innerHTML = `<span class="sub-item-name">Share Chai Break (+25 HP to Team)</span>`;
      chaiBtn.addEventListener('click', () => {
        sfx.playHeal();
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);
        this.updateHpUI();
        this.typeDialogue(`Trainer shared warm celestial chai! Restored 25 HP!`, () => this.triggerEnemyTurn());
      });
      grid.appendChild(chaiBtn);
    } else if (category === 'item') {
      title.textContent = 'TRAINER BAG ITEMS:';
      const items = [
        { name: `Celestial Tea (+30 HP) [x${this.inventory.potions}]`, count: this.inventory.potions, heal: 30, use: () => this.inventory.potions-- },
        { name: `Sacred Elixir (+60 HP) [x${this.inventory.elixirs}]`, count: this.inventory.elixirs, heal: 60, use: () => this.inventory.elixirs-- },
        { name: `Rare Candy (+1 Lvl) [x${this.inventory.candies}]`, count: this.inventory.candies, heal: 0, lvl: true, use: () => this.inventory.candies-- }
      ];
      items.forEach(it => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item-btn';
        btn.innerHTML = `<span class="sub-item-name">${it.name}</span>`;
        btn.addEventListener('click', () => {
          if (it.count <= 0) {
            showToast('Item depleted!');
            return;
          }
          it.use();
          sfx.playHeal();
          if (it.lvl) {
            this.player.level += 1;
            showToast(`Trainer reached Level ${this.player.level}!`);
          } else {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + it.heal);
          }
          this.updateHpUI();
          this.typeDialogue(`Trainer used an item from the satchel!`, () => this.triggerEnemyTurn());
        });
        grid.appendChild(btn);
      });
    } else if (category === 'mercy') {
      title.textContent = 'CATCH OR ESCAPE:';
      const opts = [
        {
          name: `Throw Pip-Capsule (x${this.inventory.capsules})`,
          desc: 'Attempt to catch the wild Pip!',
          action: () => this.attemptCatch()
        },
        {
          name: 'RUN / Flee ([R])',
          desc: 'Escape battle safely back to overworld (Press [R])',
          action: () => this.escapeBattle()
        }
      ];
      opts.forEach(o => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item-btn';
        btn.innerHTML = `<span class="sub-item-name">${o.name}</span><span class="sub-item-meta">${o.desc}</span>`;
        btn.addEventListener('click', o.action);
        grid.appendChild(btn);
      });
    }
  }

  switchBattlePokemon(speciesKey) {
    this.closeSubmenu();
    if (speciesKey === this.activePokemonKey) {
      showToast(`${this.speciesData[speciesKey].name} is already battling!`);
      return;
    }
    this.activePokemonKey = speciesKey;
    const poke = this.speciesData[speciesKey];
    sfx.playSelect();

    // Update UI elements in player battle card
    const pNameEl = document.getElementById('player-battle-name');
    const pType1 = document.getElementById('player-type-badge-1');
    const pType2 = document.getElementById('player-type-badge-2');
    const pPartnerImg = document.getElementById('player-partner-img');

    if (pNameEl) pNameEl.textContent = poke.name;
    if (pType1) {
      pType1.textContent = poke.type1;
      pType1.className = `psc-badge ${poke.badgeClass || 'type-trainer'}`;
    }
    if (pType2) pType2.textContent = poke.type2 || 'PARTNER';
    if (pPartnerImg) {
      pPartnerImg.src = poke.spriteSrc;
      pPartnerImg.alt = poke.name;
    }

    this.typeDialogue(`DEEPSHIKHA sent out ${poke.name}! "I choose you!"`, () => {
      this.triggerEnemyTurn();
    });
  }

  closeSubmenu() {
    sfx.playClick();
    const panel = document.getElementById('pip-submenu-panel');
    if (panel) panel.style.display = 'none';
  }

  executeAttack(move) {
    this.closeSubmenu();
    sfx.playAttack();

    const activeData = this.speciesData[this.activePokemonKey] || this.speciesData.flamechar;
    const sprite = document.getElementById('enemy-sprite');
    if (sprite) {
      sprite.classList.add('arena-shake');
      setTimeout(() => sprite.classList.remove('arena-shake'), 400);
    }

    // Type effectiveness check
    let mult = 1.0;
    let effectMsg = '';
    const et1 = this.pip.type1;
    const et2 = this.pip.type2;
    if ((move.type === 'FIRE' && (et1 === 'GRASS' || et2 === 'GRASS' || et1 === 'STEEL' || et2 === 'STEEL')) ||
        (move.type === 'WATER' && (et1 === 'FIRE' || et2 === 'FIRE')) ||
        (move.type === 'GRASS' && (et1 === 'WATER' || et2 === 'WATER')) ||
        (move.type === 'ELECTRIC' && (et1 === 'WATER' || et2 === 'WATER')) ||
        (move.type === 'GHOST' && (et1 === 'PSYCHIC' || et2 === 'PSYCHIC')) ||
        (move.type === 'PSYCHIC' && (et1 === 'POISON' || et2 === 'POISON'))) {
      mult = 1.5;
      effectMsg = " It's super effective!";
    }

    const dealt = Math.round(move.dmg * mult);
    this.pip.hp = Math.max(0, this.pip.hp - dealt);
    this.updateHpUI();

    if (this.pip.hp <= 0) {
      sfx.playVictory();
      if (this.currentBattleContext?.isGym) {
        const leader = this.currentBattleContext.leader;
        leader.defeated = true;
        if (this.badges) this.badges[leader.badgeKey] = true;
        this.updateHUD();

        const victoryText = `VICTORY! Gym Leader ${leader.name} was defeated! You earned the official ${leader.badge} BADGE!`;
        this.typeDialogue(victoryText, () => {
          showToast(`Won the ${leader.badge} Badge!`);
          setTimeout(() => {
            this.setMode('overworld');
            this.showDialogue(leader.name, leader.victorySpeech);
          }, 2000);
        });
      } else {
        this.typeDialogue(`Incredible! Wild ${this.pip.name} was defeated! Earned 120 EXP!${effectMsg}`, () => {
          showToast(`Defeated ${this.pip.name}!`);
          setTimeout(() => this.setMode('overworld'), 2000);
        });
      }
    } else {
      this.typeDialogue(`${activeData.name} used ${move.name}! Dealt ${dealt} damage!${effectMsg}`, () => {
        this.triggerEnemyTurn();
      });
    }
  }

  attemptCatch() {
    this.closeSubmenu();
    if (this.currentBattleContext?.isGym) {
      showToast("Cannot catch a Gym Leader's Pokémon!");
      this.typeDialogue(`Gym Leader ${this.currentBattleContext.leader.name} blocked the Pip-Capsule! "You cannot catch a Gym Leader's Pokémon!"`, () => {
        this.triggerEnemyTurn();
      });
      return;
    }
    if (this.inventory.capsules <= 0) {
      showToast('Out of Pip-Capsules! Find more in Route 1!');
      return;
    }
    this.inventory.capsules--;

    sfx.playSelect();
    const dialogue = document.getElementById('pip-dialogue-text');
    if (dialogue) {
      dialogue.innerHTML = `Trainer threw a Pip-Capsule...!`;
    }

    setTimeout(() => {
      sfx.playCapsuleWobble();
      if (dialogue) dialogue.innerHTML = `Wobble... (1)`;
    }, 800);

    setTimeout(() => {
      sfx.playCapsuleWobble();
      if (dialogue) dialogue.innerHTML = `Wobble... (2)`;
    }, 1600);

    setTimeout(() => {
      sfx.playCapsuleWobble();
      if (dialogue) dialogue.innerHTML = `Wobble... (3)`;
    }, 2400);

    setTimeout(() => {
      const catchRate = this.isRefactored ? 0.95 : (1 - this.pip.hp / this.pip.maxHp) * 0.85;
      const success = Math.random() < Math.max(0.4, catchRate) || this.pip.hp <= 35;

      if (success) {
        sfx.playVictory();
        this.isTamed = true;
        this.dex[this.currentSpeciesKey] = true; // Registered to Pip-Dex!
        if (!this.playerTeam.includes(this.currentSpeciesKey)) {
          this.playerTeam.push(this.currentSpeciesKey);
        }
        this.updateHUD();

        const tag = document.getElementById('enemy-status-tag');
        if (tag) {
          tag.textContent = 'CAUGHT!';
          tag.style.backgroundColor = '#a3e635';
        }

        this.typeDialogue(`GOTCHA! Wild ${this.pip.name} was caught and registered to your Pip-Dex!`, () => {
          showToast(`Caught ${this.pip.name}! Added to Pip-Dex & Team!`);
          setTimeout(() => this.setMode('overworld'), 2200);
        });
      } else {
        sfx.playHurt();
        this.typeDialogue(`Oh no! ${this.pip.name} broke free from the Pip-Capsule!`, () => {
          this.triggerEnemyTurn();
        });
      }
    }, 3200);
  }

  // Undertale Dodging Round (Enemy Turn)
  triggerEnemyTurn() {
    this.closeSubmenu();
    const dSection = document.getElementById('pip-dialogue-section');
    const dodgeSection = document.getElementById('pip-dodging-section');
    const timerBadge = document.getElementById('dodge-timer-badge');

    if (dSection) dSection.style.display = 'none';
    if (dodgeSection) dodgeSection.style.display = 'flex';

    this.isDodging = true;
    this.dodgeTimeLeft = 4.5;
    this.dodgePlayer = { x: 260, y: 90, size: 14 };
    this.bullets = [];

    // Spawn bullets based on Pip type
    for (let i = 0; i < 16; i++) {
      this.bullets.push({
        x: Math.random() * 520,
        y: -10 - Math.random() * 180,
        vx: (Math.random() - 0.5) * 2.6,
        vy: 2.0 + Math.random() * 2.2,
        size: 9 + Math.random() * 5,
        type: this.pip?.bulletType || 'fire',
        angle: Math.random() * Math.PI * 2
      });
    }

    clearInterval(this.dodgeInterval);
    this.dodgeInterval = setInterval(() => {
      this.dodgeTimeLeft -= 0.1;
      if (timerBadge) timerBadge.textContent = `TIME: ${Math.max(0, this.dodgeTimeLeft).toFixed(1)}s`;
      if (this.dodgeTimeLeft <= 0) {
        this.stopDodging();
      }
    }, 100);

    const loop = () => {
      if (!this.isDodging || !this.dodgeCtx) return;
      this.updateDodgePhysics();
      this.drawDodgeCanvas();
      this.dodgeAnimId = requestAnimationFrame(loop);
    };
    this.dodgeAnimId = requestAnimationFrame(loop);
  }

  updateDodgePhysics() {
    const dp = this.dodgePlayer;
    const spd = 4.2;
    if (this.keys['arrowup'] || this.keys['w'] || this.keys['up']) dp.y -= spd;
    if (this.keys['arrowdown'] || this.keys['s'] || this.keys['down']) dp.y += spd;
    if (this.keys['arrowleft'] || this.keys['a'] || this.keys['left']) dp.x -= spd;
    if (this.keys['arrowright'] || this.keys['d'] || this.keys['right']) dp.x += spd;

    dp.x = Math.max(dp.size, Math.min(520 - dp.size, dp.x));
    dp.y = Math.max(dp.size, Math.min(180 - dp.size, dp.y));

    this.bullets.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.angle += 0.05;

      if (b.y > 190) {
        b.y = -10;
        b.x = Math.random() * 520;
      }

      const dist = Math.hypot(b.x - dp.x, b.y - dp.y);
      if (dist < dp.size + b.size * 0.6) {
        sfx.playHurt();
        this.player.hp = Math.max(0, this.player.hp - 2);
        this.updateHpUI();
        b.y = 200;
      }
    });
  }

  drawDodgeCanvas() {
    const ctx = this.dodgeCtx;
    ctx.clearRect(0, 0, 520, 180);

    // Matrix grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < 520; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 180); ctx.stroke();
    }
    for (let y = 0; y < 180; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(520, y); ctx.stroke();
    }

    // Bullets
    this.bullets.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      if (b.type === 'fire') {
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.arc(0, 0, b.size * 0.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(0, 0, b.size * 0.3, 0, Math.PI * 2); ctx.fill();
      } else if (b.type === 'data') {
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(';', 0, 0);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size);
      }
      ctx.restore();
    });

    // Player heart soul
    const dp = this.dodgePlayer;
    ctx.save();
    ctx.translate(dp.x, dp.y);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, dp.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  stopDodging() {
    this.isDodging = false;
    clearInterval(this.dodgeInterval);
    cancelAnimationFrame(this.dodgeAnimId);

    const dSection = document.getElementById('pip-dialogue-section');
    const dodgeSection = document.getElementById('pip-dodging-section');

    if (dodgeSection) dodgeSection.style.display = 'none';
    if (dSection) dSection.style.display = 'flex';

    const activePoke = this.speciesData[this.activePokemonKey] || { name: 'FLAMECHAR' };
    this.typeDialogue(`What will ${activePoke.name} do next?`);
  }

  // ========================================================
  // PIP-DEX & TRAINER CARD RENDERING
  // ========================================================
  renderDexUI() {
    const grid = document.getElementById('dex-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(this.speciesData).forEach(key => {
      const sp = this.speciesData[key];
      const isCaught = this.dex[key];
      const isActive = (key === this.activePokemonKey);

      const card = document.createElement('div');
      card.className = `dex-card ${isCaught ? 'caught' : ''} ${isActive ? 'active-partner-card' : ''}`;
      card.innerHTML = `
        <span class="dex-card-num">${sp.id}</span>
        <img src="${sp.spriteSrc}" alt="${sp.name}" class="dex-card-img" style="filter: ${isCaught ? 'none' : 'brightness(0.3) grayscale(1)'};">
        <span class="dex-card-name">${isCaught ? sp.name : '???'}</span>
        <div class="dex-card-types">
          <span class="psc-badge ${sp.badgeClass}">${sp.type1}</span>
          <span class="psc-badge type-code">${sp.type2}</span>
        </div>
        <span class="dex-card-status ${isCaught ? 'caught' : 'wild'}">${isCaught ? (isActive ? 'ACTIVE PARTNER' : 'CAUGHT (Click to Partner)') : 'UNKNOWN'}</span>
      `;

      if (isCaught) {
        card.style.cursor = 'pointer';
        card.title = `Click to set ${sp.name} as your following partner & battle lead!`;
        card.addEventListener('click', () => {
          sfx.playSelect();
          this.activePokemonKey = key;
          showToast(`Set ${sp.name} as your following partner!`);
          this.renderDexUI();
        });
      }

      grid.appendChild(card);
    });

    this.updateHUD();
  }
}

const pipGame = new CatchThatPipGame();


// ========================================================
// 7. DESKTOP OS WINDOW MANAGEMENT & LIVE CLOCK
// ========================================================
// Window minimize and close actions
document.querySelectorAll('.retro-window').forEach(win => {
  const closeBtn = win.querySelector('.win-btn.close');
  const minBtn = win.querySelector('.win-btn.minimize');
  const body = win.querySelector('.window-body');

  closeBtn?.addEventListener('click', () => {
    sfx.playClick();
    win.style.display = 'none';
  });

  minBtn?.addEventListener('click', () => {
    sfx.playClick();
    if (body) {
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    }
  });
});

// Tab navigation inside C:\DEEPSHIKHA\toolbox
const tabButtons = document.querySelectorAll('.win-tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sfx.playClick();
    tabButtons.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const targetTabId = 'tab-' + btn.getAttribute('data-tab');
    const targetPane = document.getElementById(targetTabId);
    if (targetPane) targetPane.classList.add('active');
  });
});

// Update OS clock every second
function updateClock() {
  const clockEl = document.getElementById('os-clock');
  if (clockEl) {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hrs}:${mins}`;
  }
}
updateClock();
setInterval(updateClock, 1000);

// Clipboard copy handlers
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const textToCopy = btn.getAttribute('data-copy');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        sfx.playClick();
        showToast('Copied ' + textToCopy + ' to clipboard!');
      }).catch(err => console.error(err));
    }
  });
});

// Modals (Contact & Resume)
const contactModal = document.getElementById('contact-modal');
const resumeModal = document.getElementById('resume-modal');

function openModal(modal) {
  sfx.playSelect();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  sfx.playClick();
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.close-modal-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const m = btn.closest('.retro-modal-overlay');
    if (m) closeModal(m);
  });
});

[contactModal, resumeModal].forEach(m => {
  m?.addEventListener('click', (e) => {
    if (e.target === m) closeModal(m);
  });
});

document.getElementById('icon-contact')?.addEventListener('click', () => openModal(contactModal));
document.getElementById('quick-contact-pill')?.addEventListener('click', () => openModal(contactModal));
document.getElementById('pinterest-contact-btn')?.addEventListener('click', () => openModal(contactModal));

document.getElementById('icon-resume')?.addEventListener('click', () => openModal(resumeModal));
document.getElementById('quick-resume-btn-bar')?.addEventListener('click', () => openModal(resumeModal));
document.getElementById('enb-link-resume')?.addEventListener('click', () => openModal(resumeModal));
document.getElementById('epc-btn-resume')?.addEventListener('click', () => openModal(resumeModal));

// Toggle between Formatted HTML Resume and Embedded PDF
const toggleResumeBtn = document.getElementById('toggle-resume-format-btn');
const resumeFormattedView = document.getElementById('resume-formatted-view');
const resumePdfView = document.getElementById('resume-pdf-view');
toggleResumeBtn?.addEventListener('click', () => {
  sfx.playClick();
  if (resumeFormattedView.style.display === 'none') {
    resumeFormattedView.style.display = 'block';
    resumePdfView.style.display = 'none';
  } else {
    resumeFormattedView.style.display = 'none';
    resumePdfView.style.display = 'block';
  }
});

// Dynamic Resume: Interactive Skill Filters
document.querySelectorAll('#resume-skills-filters .skill-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    sfx.playSelect();
    document.querySelectorAll('#resume-skills-filters .skill-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.getAttribute('data-skill-cat');
    const chips = document.querySelectorAll('#resume-skills-grid .skill-chip-pill');
    chips.forEach(chip => {
      const chipCat = chip.getAttribute('data-cat');
      if (cat === 'all' || chipCat === cat) {
        chip.classList.remove('hidden-by-filter');
      } else {
        chip.classList.add('hidden-by-filter');
      }
    });
  });
});


} // End of browser environment guard
