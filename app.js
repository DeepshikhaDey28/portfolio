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
      walk: new Audio('assets/sounds/walk.mp3')
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
      this.audioFiles.walk.volume = 0.28;
    } catch (e) {}

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

  // Real walking footstep sound
  playWalk() {
    if (!this.sfxEnabled) return;
    const now = Date.now();
    if (now - this.lastWalkTime < 240) return; // Throttled footstep cadence
    this.lastWalkTime = now;
    try {
      this.audioFiles.walk.currentTime = 0;
      this.audioFiles.walk.play().catch(() => {});
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

  // View-based dynamic background music manager
  setBgmForView(view) {
    this.currentView = view;
    if (!this.bgmEnabled) {
      this.stopAllBgm();
      this.syncUi(false);
      return;
    }

    const targetAudio = (view === 'game') ? this.audioFiles.gameBgm : this.audioFiles.websiteBgm;
    const otherAudio = (view === 'game') ? this.audioFiles.websiteBgm : this.audioFiles.gameBgm;

    try {
      otherAudio.pause();
      if (view === 'game' && targetAudio.paused) {
        targetAudio.currentTime = 0;
      }
      if (targetAudio.paused) {
        const p = targetAudio.play();
        if (p !== undefined) {
          p.then(() => {
            this.isUnlocked = true;
            this.syncUi(true);
          }).catch(() => {
            // Browser autoplay blocked until user gesture
            this.isUnlocked = false;
            this.syncUi(true);
          });
        }
      } else {
        this.syncUi(true);
      }
    } catch (e) {}
  }

  toggleBgm() {
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgmEnabled) {
      this.setBgmForView(this.currentView);
    } else {
      this.stopAllBgm();
    }
    this.syncUi(this.bgmEnabled);
    return this.bgmEnabled;
  }

  stopAllBgm() {
    try {
      this.audioFiles.websiteBgm.pause();
      this.audioFiles.gameBgm.pause();
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
      // Fallback seed repositories based on user's GitHub
      const fallbackRepos = [
        {
          name: 'B2B-bussiness-website-',
          html_url: 'https://github.com/DeepshikhaDey28/B2B-bussiness-website-',
          description: 'Front-end multi-product commercial web application for retail and wholesale catalog operations.',
          language: 'HTML',
          stargazers_count: 1,
          forks_count: 0,
          updated_at: '2026-06-01T11:49:52Z'
        },
        {
          name: 'weatherwhether',
          html_url: 'https://github.com/DeepshikhaDey28/weatherwhether',
          description: 'Real-time weather forecast and atmospheric condition telemetry dashboard.',
          language: 'HTML',
          stargazers_count: 0,
          forks_count: 0,
          updated_at: '2026-08-20T10:15:00Z'
        },
        {
          name: 'First_Python',
          html_url: 'https://github.com/DeepshikhaDey28/First_Python',
          description: 'Core computational and algorithmic hub in Python covering data structures and memory scope.',
          language: 'Python',
          stargazers_count: 0,
          forks_count: 0,
          updated_at: '2026-08-25T14:41:50Z'
        },
        {
          name: 'deep_thoughts_app_for_notes',
          html_url: 'https://github.com/DeepshikhaDey28/deep_thoughts_app_for_notes',
          description: 'Interactive responsive web notes and idea journaling application.',
          language: 'HTML',
          stargazers_count: 0,
          forks_count: 0,
          updated_at: '2026-07-15T09:30:00Z'
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
  const container = document.getElementById('github-repos-container');
  if (!container) return;

  container.innerHTML = '';
  repos.forEach(repo => {
    const card = document.createElement('article');
    card.className = 'repo-card';
    card.setAttribute('data-category', 'github ' + (repo.language ? repo.language.toLowerCase() : ''));

    const lang = repo.language || 'Code';
    const langColor = langColors[lang] || langColors.Default;
    const desc = repo.description || 'No description provided. Public repository under @DeepshikhaDey28.';
    const date = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : 'Recent';

    card.innerHTML = `
      <div>
        <div class="repo-top">
          <a href="${repo.html_url}" target="_blank" class="repo-name-link" title="Open repository on GitHub">
            <span>🐙</span> ${repo.name}
          </a>
          <span class="repo-badge">${lang}</span>
        </div>
        <p class="repo-desc">${desc}</p>
      </div>
      <div class="repo-footer">
        <div class="repo-meta-left">
          <span><span class="repo-lang-dot" style="background-color: ${langColor};"></span>${lang}</span>
          <span class="repo-stars">★ ${repo.stargazers_count || 0}</span>
          <span class="repo-forks">⑂ ${repo.forks_count || 0}</span>
        </div>
        <a href="${repo.html_url}" target="_blank" class="repo-action-btn">
          <span>View Code ↗</span>
        </a>
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
// 5. PROJECT RUNNER MODAL (Interactive Canvas/Apps Launcher)
// ========================================================
const runnerModal = document.getElementById('project-runner-modal');
const runnerIframe = document.getElementById('runner-iframe');
const runnerTitle = document.getElementById('runner-modal-title');
const runnerExternalLink = document.getElementById('runner-external-link');

function launchProjectApp(url, title) {
  sfx.playSelect();
  if (runnerTitle) runnerTitle.textContent = `C:\\DEEPSHIKHA\\apps\\${title}.exe`;
  if (runnerExternalLink) runnerExternalLink.href = url;
  if (runnerIframe) runnerIframe.src = url;
  if (runnerModal) {
    runnerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

document.querySelectorAll('.run-project-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const url = btn.getAttribute('data-url');
    const title = btn.getAttribute('data-title') || 'Interactive App';
    if (url) launchProjectApp(url, title);
  });
});

document.querySelectorAll('.close-runner-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    sfx.playClick();
    if (runnerModal) runnerModal.classList.remove('active');
    if (runnerIframe) runnerIframe.src = '';
    document.body.style.overflow = '';
  });
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
      x: 8 * 32,
      y: 7 * 32,
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
      dustParticles: []
    };

    // Camera
    this.camera = { x: 0, y: 0, width: 640, height: 360 };

    // Inventory
    this.inventory = {
      capsules: 5,
      potions: 3,
      elixirs: 1,
      candies: 1
    };

    // Pip-Dex Caught Registry (6 Unique Species)
    this.dex = {
      flamechar: false,
      bulbasprout: false,
      buggypip: false,
      aquabyte: false,
      voltasync: false,
      neuropip: false
    };

    // 6 Species Catalog
    this.speciesData = {
      flamechar: {
        id: '#001',
        name: 'FLAMECHAR',
        level: 28,
        hp: 85,
        maxHp: 85,
        type1: 'FIRE',
        type2: 'CODE',
        badgeClass: 'type-fire',
        spriteSrc: 'assets/flamechar_sprite.svg',
        zone: 'Route 1: Python Meadow',
        greeting: 'Wild FLAMECHAR sparks with enthusiasm! Its tail flame crackles with Python bytecode!',
        inspect: 'FLAMECHAR: Fire/Code Pip! Known for fiery performance. Weak to clean formatting and iced chai.',
        bulletType: 'fire',
        moves: [
          { name: 'Python Strike', type: 'FIRE', dmg: 35, desc: 'Fiery bytecode pulse' },
          { name: 'Vector Blast', type: 'CODE', dmg: 45, desc: 'Vectorized tensor beam' },
          { name: 'Flame Byte', type: 'FIRE', dmg: 25, desc: 'Ember compilation slice' },
          { name: 'Overclock Hotfix', type: 'CODE', dmg: 55, desc: 'Critical deploy burst' }
        ]
      },
      bulbasprout: {
        id: '#002',
        name: 'BULBASPROUT',
        level: 28,
        hp: 90,
        maxHp: 90,
        type1: 'DATA',
        type2: 'GRASS',
        badgeClass: 'type-trainer',
        spriteSrc: 'assets/bulbasprout_sprite.svg',
        zone: 'Route 1: Python Meadow',
        greeting: 'Wild BULBASPROUT emerged from the Pandas DataFrame! It wields data decision trees!',
        inspect: 'BULBASPROUT: Data/Tree Pip! Grows rapidly with clean SQL tables and Tableau charts.',
        bulletType: 'data',
        moves: [
          { name: 'DataFrame Vine', type: 'GRASS', dmg: 30, desc: 'Pandas column whip' },
          { name: 'SQL Query Splash', type: 'DATA', dmg: 40, desc: 'Heavy indexed query' },
          { name: 'Tableau Bloom', type: 'DATA', dmg: 45, desc: 'KPI metric blast' },
          { name: 'Decision Root', type: 'GRASS', dmg: 25, desc: 'Root node shock' }
        ]
      },
      buggypip: {
        id: '#003',
        name: 'BUGGYPIP',
        level: 28,
        hp: 75,
        maxHp: 75,
        type1: 'GLITCH',
        type2: 'CYBER',
        badgeClass: 'type-glitch',
        spriteSrc: 'assets/buggypip_sprite.svg',
        zone: 'Route 3: Cyber Matrix',
        greeting: 'Wild BUGGYPIP threatens production release! "Uncaught TypeError at index.js:42"!',
        inspect: 'BUGGYPIP: Glitch Pip! Feeds on missing semicolons. Can be pacified by Refactoring Code.',
        bulletType: 'glitch',
        moves: [
          { name: 'TypeError Spike', type: 'GLITCH', dmg: 35, desc: 'Null reference crash' },
          { name: 'Memory Leak', type: 'CYBER', dmg: 45, desc: 'RAM exhaustion wave' },
          { name: 'Infinite Loop', type: 'GLITCH', dmg: 50, desc: 'Thread blocking spike' },
          { name: 'Patch Reject', type: 'CYBER', dmg: 30, desc: 'Merge conflict pulse' }
        ]
      },
      aquabyte: {
        id: '#004',
        name: 'AQUABYTE',
        level: 28,
        hp: 92,
        maxHp: 92,
        type1: 'WATER',
        type2: 'SQL',
        badgeClass: 'type-code',
        spriteSrc: 'assets/aquabyte_sprite.svg',
        zone: 'Route 2: Data Lake',
        greeting: 'Wild AQUABYTE surfaced from the SQL telemetry stream! Its database shell glistens with queries!',
        inspect: 'AQUABYTE: Water/SQL Pip! Hardened database shell. Highly resistant to unindexed queries.',
        bulletType: 'data',
        moves: [
          { name: 'SQL Splash', type: 'WATER', dmg: 35, desc: 'High-speed relational stream' },
          { name: 'Telemetry Pump', type: 'SQL', dmg: 45, desc: 'Live sensor pressure surge' },
          { name: 'Pipeline Wave', type: 'WATER', dmg: 50, desc: 'Data cleansing tsunami' },
          { name: 'Schema Jet', type: 'SQL', dmg: 30, desc: 'Table schema pulse' }
        ]
      },
      voltasync: {
        id: '#005',
        name: 'VOLTASYNC',
        level: 28,
        hp: 80,
        maxHp: 80,
        type1: 'ELECTRIC',
        type2: 'REACT',
        badgeClass: 'type-fire',
        spriteSrc: 'assets/voltasync_sprite.svg',
        zone: 'Route 3: Cyber Matrix',
        greeting: 'Wild VOLTASYNC discharged async promises! Lightning sparks from its React state ears!',
        inspect: 'VOLTASYNC: Electric/React Pip! Bounces through the Virtual DOM at 120 FPS!',
        bulletType: 'fire',
        moves: [
          { name: 'React Spark', type: 'ELECTRIC', dmg: 35, desc: 'Virtual DOM re-render zap' },
          { name: 'Async Bolt', type: 'REACT', dmg: 45, desc: 'Await promise lightning' },
          { name: 'State Thunder', type: 'ELECTRIC', dmg: 55, desc: 'High-voltage hook surge' },
          { name: 'Prop Shock', type: 'REACT', dmg: 28, desc: 'Direct prop collision' }
        ]
      },
      neuropip: {
        id: '#006',
        name: 'NEUROPIP',
        level: 28,
        hp: 88,
        maxHp: 88,
        type1: 'PSYCHIC',
        type2: 'AI',
        badgeClass: 'type-trainer',
        spriteSrc: 'assets/neuropip_sprite.svg',
        zone: 'Route 3: Cyber Matrix',
        greeting: 'Wild NEUROPIP hovered into reality! Its neural crystal glows with deep learning embeddings!',
        inspect: 'NEUROPIP: Psychic/AI Pip! Analyzes multi-dimensional patterns and optimizes neural layers.',
        bulletType: 'glitch',
        moves: [
          { name: 'Neural Beam', type: 'PSYCHIC', dmg: 40, desc: 'Multi-layer perceptron ray' },
          { name: 'Tensor Strike', type: 'AI', dmg: 50, desc: 'Multi-dimensional matrix hit' },
          { name: 'Deep Learning', type: 'PSYCHIC', dmg: 60, desc: 'Gradient descent wave' },
          { name: 'Attention Wave', type: 'AI', dmg: 32, desc: 'Transformer attention pulse' }
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

    // Map Dimensions (40 x 30 tiles @ 32px each = 1280 x 960 world)
    this.mapCols = 40;
    this.mapRows = 30;
    this.tileSize = 32;

    // Build Open World Map Tiles & Entity Objects
    this.initWorldMap();

    // Init DOM Hooks
    this.initDOM();
  }

  initWorldMap() {
    // 0: Lab Floor (Parquet)
    // 1: Lab Wall (Solid)
    // 2: Lab Furniture/Desk/PC (Solid)
    // 3: Outdoor Cobble/Dirt Path (Walkable)
    // 4: Outdoor Meadow Grass (Walkable)
    // 5: Tall Wild Grass (Walkable, triggers encounters!)
    // 6: Deep Water (Solid)
    // 7: Wooden Bridge (Walkable)
    // 8: Cyber Circuit Matrix (Walkable)
    // 9: Outer Pine Trees / Border (Solid)
    this.tiles = [];
    for (let r = 0; r < this.mapRows; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < this.mapCols; c++) {
        // Outer boundaries
        if (r === 0 || r === this.mapRows - 1 || c === 0 || c === this.mapCols - 1) {
          this.tiles[r][c] = 9;
        }
        // PALLET DEV LAB (Top-Left: c: 1..15, r: 1..13)
        else if (c >= 1 && c <= 15 && r >= 1 && r <= 13) {
          if (r === 1 || c === 1 || c === 15 || (r === 13 && c !== 8 && c !== 9)) {
            this.tiles[r][c] = 1; // Lab Wall
          } else if (r === 3 && (c >= 3 && c <= 6)) {
            this.tiles[r][c] = 2; // Lab Computer Desk & Servers
          } else if (r === 3 && (c >= 10 && c <= 13)) {
            this.tiles[r][c] = 2; // Lab Bookshelf & PC
          } else {
            this.tiles[r][c] = 0; // Lab Parquet Floor
          }
        }
        // DATA LAKE (Bottom-Left: c: 1..16, r: 16..28)
        else if (c >= 2 && c <= 16 && r >= 17 && r <= 27) {
          // Wooden bridge spanning lake at c: 8..9
          if ((c === 8 || c === 9) && r >= 17 && r <= 26) {
            this.tiles[r][c] = 7; // Bridge
          } else if (c === 2 || c === 16 || r === 17 || r === 27) {
            this.tiles[r][c] = 3; // Shore path
          } else {
            this.tiles[r][c] = 6; // Deep animated water
          }
        }
        // CYBER CIRCUIT MATRIX (Bottom-Right: c: 18..38, r: 16..28)
        else if (c >= 18 && c <= 38 && r >= 16 && r <= 28) {
          if (r === 16 || c === 18) {
            this.tiles[r][c] = 3; // Path divider
          } else if ((r === 20 || r === 25) && (c === 23 || c === 31)) {
            this.tiles[r][c] = 9; // Cyber server monolith
          } else {
            this.tiles[r][c] = 8; // Cyber circuit tile
          }
        }
        // ROUTE 1: PYTHON MEADOW (Top-Right: c: 16..38, r: 1..15)
        else {
          // Cobble paths
          if (c === 16 || c === 17 || (r === 14 && c <= 28) || (c === 27 && r <= 14)) {
            this.tiles[r][c] = 3; // Path
          }
          // Tall Wild Grass patches
          else if ((c >= 20 && c <= 25 && r >= 4 && r <= 10) || (c >= 29 && c <= 36 && r >= 5 && r <= 12)) {
            this.tiles[r][c] = 5; // Tall Grass
          } else {
            this.tiles[r][c] = 4; // Meadow Grass
          }
        }
      }
    }

    // NPCs
    this.npcs = [
      {
        id: 'oak',
        name: 'DEV MENTOR OAK',
        x: 8 * 32,
        y: 4 * 32,
        color: '#dc2626',
        dialogue: "Welcome, Deepshikha! The Open Dev Region is brimming with 6 wild algorithmic Pips! Step into tall grass or approach roaming creatures on the routes to catch them and complete your Pip-Dex!"
      },
      {
        id: 'python_dev',
        name: 'PYTHON ENGINEER',
        x: 27 * 32,
        y: 7 * 32,
        color: '#2563eb',
        dialogue: "Did you know? Deepshikha architected the First_Python algorithmic hub and B2B eCommerce platform! Wild Flamechar and Bulbasprout love clean Python loops!"
      },
      {
        id: 'telemetry_lead',
        name: 'SEVRA TELEMETRY LEAD',
        x: 9 * 32,
        y: 16 * 32,
        color: '#059669',
        dialogue: "At Sevra AI, Deepshikha led front-end UI and built SQL data pipelines monitoring device telemetry in real-time. Look into the Data Lake for wild Aquabyte!"
      },
      {
        id: 'cyber_sec',
        name: 'SECURITY ANALYST',
        x: 23 * 32,
        y: 20 * 32,
        color: '#7c3aed',
        dialogue: "Deepshikha's B.Tech Computer Science Cyber Security specialization (CGPA 8.94)! In this Cyber Matrix, Buggypip, Voltasync, and Neuropip thrive!"
      }
    ];

    // Interactive Objects (Healing Station, Signs, Items)
    this.interactives = [
      {
        type: 'heal',
        x: 4 * 32,
        y: 3 * 32,
        label: 'Coffee / Nurse Station',
        action: () => this.healTrainer()
      },
      {
        type: 'pc',
        x: 12 * 32,
        y: 3 * 32,
        label: 'Dev PC Terminal',
        action: () => this.showDialogue('DEV TERMINAL', "Git status: Clean branch 'main'. 4 projects deployed to Vercel and GitHub with 0 lint errors!")
      },
      {
        type: 'sign',
        x: 8 * 32,
        y: 14 * 32,
        text: "📍 PALLET DEV LAB: Deepshikha Dey's Engineering Headquarters. Exit ahead to Route 1."
      },
      {
        type: 'sign',
        x: 20 * 32,
        y: 4 * 32,
        text: "📍 ROUTE 1: PYTHON MEADOW. High concentration of wild Flamechar & Bulbasprout in the tall grass!"
      },
      {
        type: 'sign',
        x: 8 * 32,
        y: 16 * 32,
        text: "📍 ROUTE 2: DATA LAKE & TELEMETRY SPRINGS. Cross bridge for live SQL streams."
      },
      {
        type: 'sign',
        x: 19 * 32,
        y: 16 * 32,
        text: "📍 ROUTE 3: CYBER MATRIX RUINS. Warning: Glitches and electric neural state spikes!"
      },
      {
        type: 'item',
        x: 35 * 32,
        y: 4 * 32,
        name: '3x Pip-Capsules',
        collected: false,
        grant: () => {
          this.inventory.capsules += 3;
          this.showDialogue('FOUND ITEM', "Deepshikha picked up 3x Pip-Capsules! Ready to catch wild Pips!");
        }
      },
      {
        type: 'item',
        x: 4 * 32,
        y: 26 * 32,
        name: 'StackOverflow Elixir',
        collected: false,
        grant: () => {
          this.inventory.elixirs += 1;
          this.showDialogue('FOUND ITEM', "Deepshikha found a StackOverflow Elixir (+60 HP Restore)!");
        }
      },
      {
        type: 'item',
        x: 36 * 32,
        y: 22 * 32,
        name: 'Rare Code Candy',
        collected: false,
        grant: () => {
          this.inventory.candies += 1;
          this.showDialogue('FOUND ITEM', "Deepshikha found a Rare Code Candy (+1 Level Boost)!");
        }
      }
    ];

    // Roaming Wild Pips in Open World
    this.roamingPips = [
      { species: 'flamechar', x: 23 * 32, y: 7 * 32, origX: 23 * 32, origY: 7 * 32, wander: 1.5, active: true },
      { species: 'bulbasprout', x: 32 * 32, y: 9 * 32, origX: 32 * 32, origY: 9 * 32, wander: 1.5, active: true },
      { species: 'aquabyte', x: 5 * 32, y: 20 * 32, origX: 5 * 32, origY: 20 * 32, wander: 1.2, active: true },
      { species: 'buggypip', x: 26 * 32, y: 22 * 32, origX: 26 * 32, origY: 22 * 32, wander: 1.5, active: true },
      { species: 'voltasync', x: 33 * 32, y: 19 * 32, origX: 33 * 32, origY: 19 * 32, wander: 1.5, active: true },
      { species: 'neuropip', x: 35 * 32, y: 26 * 32, origX: 35 * 32, origY: 26 * 32, wander: 1.5, active: true }
    ];
  }

  initDOM() {
    this.owCanvas = document.getElementById('pip-overworld-canvas');
    if (this.owCanvas) this.owCtx = this.owCanvas.getContext('2d');

    this.dodgeCanvas = document.getElementById('pip-dodge-canvas');
    if (this.dodgeCanvas) this.dodgeCtx = this.dodgeCanvas.getContext('2d');

    // Preload trainer avatar
    this.pfpImage = new Image();
    this.pfpImage.src = 'assets/profile.jpg';

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(k)) {
        if (this.mode === 'overworld' || this.isDodging) e.preventDefault();
      }
      this.keys[k] = true;

      // Sprinting via Shift
      if (e.key === 'Shift') this.player.isSprinting = true;

      // Interact via Space or Z or Enter
      if ((k === ' ' || k === 'z' || k === 'enter') && this.mode === 'overworld') {
        this.handleActionPress();
      }

      // Dex / Menu toggle via Esc or X
      if (k === 'escape' || k === 'x') {
        if (this.mode === 'dex') this.setMode('overworld');
        else if (this.mode === 'overworld') this.setMode('dex');
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
      else if (this.mode === 'dex') this.setMode('overworld');
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
  }

  setMode(targetMode) {
    this.mode = targetMode;

    const owView = document.getElementById('view-overworld');
    const battleView = document.getElementById('view-battle');
    const dexView = document.getElementById('view-dex');
    const modeBtnText = document.getElementById('game-mode-text');

    if (owView) owView.style.display = targetMode === 'overworld' ? 'block' : 'none';
    if (battleView) battleView.style.display = targetMode === 'battle' ? 'block' : 'none';
    if (dexView) dexView.style.display = targetMode === 'dex' ? 'block' : 'none';

    if (modeBtnText) {
      if (targetMode === 'overworld') modeBtnText.textContent = '🗺️ Open World';
      else if (targetMode === 'battle') modeBtnText.textContent = '⚔️ Battle Arena';
      else modeBtnText.textContent = '📖 Pip-Dex';
    }

    if (targetMode === 'overworld') {
      this.startOverworldLoop();
      this.stopDodging();
    } else if (targetMode === 'battle') {
      cancelAnimationFrame(this.owAnimId);
    } else if (targetMode === 'dex') {
      cancelAnimationFrame(this.owAnimId);
      this.renderDexUI();
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
    if (this.dialogueActive) return;

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

      // Footstep audio
      sfx.playWalk();

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
      if (this.tiles[tileRow] && this.tiles[tileRow][tileCol] === 5) {
        p.stepCount++;
        // 1.8% wild encounter roll per moving step in grass
        if (p.stepCount > 35 && Math.random() < 0.045) {
          p.stepCount = 0;
          const grassSpecies = Math.random() < 0.5 ? 'flamechar' : 'bulbasprout';
          this.triggerWildEncounter(grassSpecies);
          return;
        }
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
    } else {
      p.isMoving = false;
      p.animFrame = 0;
    }

    // Update dust particles
    for (let i = p.dustParticles.length - 1; i >= 0; i--) {
      const dp = p.dustParticles[i];
      dp.life -= 0.05;
      dp.y -= 0.4;
      if (dp.life <= 0) p.dustParticles.splice(i, 1);
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

    const solidTypes = [1, 2, 6, 9]; // Wall, Desk, Water, Trees/Border
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
    let zone = 'Route 1: Python Meadow';
    if (c <= 15 && r <= 13) zone = 'Pallet Dev Lab';
    else if (c <= 16 && r >= 16) zone = 'Route 2: Data Lake';
    else if (c >= 18 && r >= 16) zone = 'Route 3: Cyber Matrix';

    pill.innerHTML = `<span>📍 ${zone}</span>`;
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
        }
      }
    }

    // 2. Draw Interactive Objects & Ground Items
    this.interactives.forEach(obj => {
      const ox = obj.x - cx;
      const oy = obj.y - cy;
      if (ox < -32 || ox > this.camera.width || oy < -32 || oy > this.camera.height) return;

      if (obj.type === 'heal') {
        // Coffee Machine / Nurse Bar
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(ox + 4, oy + 4, 24, 24);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('☕', ox + 8, oy + 21);
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

    // 3. Draw NPCs
    this.npcs.forEach(npc => {
      const nx = npc.x - cx;
      const ny = npc.y - cy;
      if (nx < -32 || nx > this.camera.width || ny < -32 || ny > this.camera.height) return;

      // NPC Body
      ctx.fillStyle = npc.color;
      ctx.fillRect(nx + 8, ny + 10, 16, 18);
      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(nx + 16, ny + 8, 7, 0, Math.PI * 2);
      ctx.fill();
      // Little shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(nx + 16, ny + 28, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.restore();
    });

    // 5. Draw Dust Particles
    ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
    this.player.dustParticles.forEach(dp => {
      ctx.beginPath();
      ctx.arc(dp.x - cx, dp.y - cy, dp.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Draw Player Trainer Deepshikha
    const p = this.player;
    const px = Math.floor(p.x - cx);
    const py = Math.floor(p.y - cy);

    // Trainer Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(px + 12, py + 26, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leg step offsets based on animFrame
    const stepOffset = p.isMoving ? (p.animFrame % 2 === 0 ? 3 : -3) : 0;

    // Shoes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(px + 6, py + 22 + (p.dir === 0 ? stepOffset : 0), 4, 6);
    ctx.fillRect(px + 14, py + 22 - (p.dir === 0 ? stepOffset : 0), 4, 6);

    // Red / Sage Trainer Jacket Body
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(px + 5, py + 11, 14, 12);
    // Yellow backpack straps
    ctx.fillStyle = '#facc15';
    ctx.fillRect(px + 7, py + 12, 2, 10);
    ctx.fillRect(px + 15, py + 12, 2, 10);

    // Head / Face
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(px + 12, py + 8, 7, 0, Math.PI * 2);
    ctx.fill();

    // Flowing dark hair
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(px + 4, py + 4, 16, 5);
    ctx.fillRect(px + 3, py + 6, 4, 9);
    ctx.fillRect(px + 17, py + 6, 4, 9);

    // Trainer Red Cap
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(px + 4, py + 1, 16, 4);
    // Cap visor facing direction
    if (p.dir === 0) ctx.fillRect(px + 8, py + 4, 8, 2); // Facing Down
    else if (p.dir === 2) ctx.fillRect(px + 2, py + 4, 6, 2); // Facing Left
    else if (p.dir === 3) ctx.fillRect(px + 16, py + 4, 6, 2); // Facing Right

    // Tall Grass Overlay over Player's feet when inside grass (classic Pokemon immersion!)
    const pTileCol = Math.floor((p.x + p.w / 2) / this.tileSize);
    const pTileRow = Math.floor((p.y + p.h / 2) / this.tileSize);
    if (this.tiles[pTileRow] && this.tiles[pTileRow][pTileCol] === 5) {
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(px + 2, py + 20, 20, 8);
    }
  }

  handleActionPress() {
    if (this.dialogueActive) {
      this.closeDialogue();
      return;
    }

    // Check entity in front of player
    const p = this.player;
    let checkX = p.x + p.w / 2;
    let checkY = p.y + p.h / 2;
    const reach = 28;

    if (p.dir === 0) checkY += reach;
    else if (p.dir === 1) checkY -= reach;
    else if (p.dir === 2) checkX -= reach;
    else if (p.dir === 3) checkX += reach;

    // Check NPC interaction
    for (const npc of this.npcs) {
      const dist = Math.hypot(checkX - (npc.x + 16), checkY - (npc.y + 16));
      if (dist < 28) {
        sfx.playClick();
        this.showDialogue(npc.name, npc.dialogue);
        return;
      }
    }

    // Check Interactive Objects
    for (const obj of this.interactives) {
      const dist = Math.hypot(checkX - (obj.x + 16), checkY - (obj.y + 16));
      if (dist < 28) {
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
    this.showDialogue('ESPRESSO NURSE HUB', "Nurse Chai brewed fresh espresso! Deepshikha and all registered Pips were restored to 100% HP!");
  }

  showDialogue(speaker, message) {
    this.dialogueActive = true;
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
  }

  updateHUD() {
    const hpEl = document.getElementById('ow-hp-count');
    const dexEl = document.getElementById('ow-dex-count');
    const dexNav = document.getElementById('dex-nav-count');

    let count = 0;
    Object.keys(this.dex).forEach(k => { if (this.dex[k]) count++; });

    if (hpEl) hpEl.textContent = `${this.player.hp}/${this.player.maxHp}`;
    if (dexEl) dexEl.textContent = `${count}/6`;
    if (dexNav) dexNav.textContent = count;
  }

  // ========================================================
  // BATTLE TRANSITION & TURN-BASED ARENA ENGINE
  // ========================================================
  triggerWildEncounter(speciesKey) {
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

  startBattle(speciesKey) {
    this.currentSpeciesKey = speciesKey;
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

    if (nameEl) nameEl.textContent = this.pip.name;
    if (b1) {
      b1.textContent = this.pip.type1;
      b1.className = `psc-badge ${this.pip.badgeClass}`;
    }
    if (b2) b2.textContent = this.pip.type2;
    if (statusTag) {
      statusTag.textContent = this.dex[speciesKey] ? 'CAUGHT' : 'WILD';
      statusTag.style.backgroundColor = this.dex[speciesKey] ? '#a3e635' : '#fef08a';
    }
    if (balloon) balloon.innerHTML = `<span>"${this.pip.greeting}"</span>`;
    if (mascotImg && this.pip.spriteSrc) {
      mascotImg.src = this.pip.spriteSrc;
      mascotImg.alt = this.pip.name;
    }

    this.updateHpUI();
    this.typeDialogue(this.pip.greeting);
  }

  typeDialogue(text, callback) {
    const el = document.getElementById('pip-dialogue-text');
    if (!el) return;
    el.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        if (i % 3 === 0 && text[i] !== ' ') sfx.playBlip();
        i++;
      } else {
        clearInterval(timer);
        if (callback) callback();
      }
    }, 20);
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

    if (category === 'fight') {
      title.textContent = 'CHOOSE A POKÉMON ATTACK:';
      const trainerMoves = [
        { name: 'Python Strike', type: 'FIRE', dmg: 35, desc: 'Fiery logic pulse' },
        { name: 'SQL Query Blast', type: 'DATA', dmg: 45, desc: 'Indexed table impact' },
        { name: 'React State Shock', type: 'ELECTRIC', dmg: 38, desc: 'High-speed async re-render' },
        { name: 'Git Commit Patch', type: 'CODE', dmg: 55, desc: 'Critical deploy strike' }
      ];
      trainerMoves.forEach(m => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item-btn';
        btn.innerHTML = `<span class="sub-item-name">⚔ ${m.name}</span><span class="sub-item-meta">${m.desc} (${m.dmg} DMG)</span>`;
        btn.addEventListener('click', () => this.executeAttack(m));
        grid.appendChild(btn);
      });
    } else if (category === 'act') {
      title.textContent = 'INTERACT & COMMUNE WITH PIP:';
      const acts = [
        { name: '* Inspect Pip', action: () => this.typeDialogue(this.pip.inspect, () => this.closeSubmenu()) },
        {
          name: '* Refactor Code',
          action: () => {
            this.isRefactored = true;
            sfx.playHeal();
            const tag = document.getElementById('enemy-status-tag');
            if (tag) {
              tag.textContent = 'REFACTORED';
              tag.style.backgroundColor = '#a7f3d0';
            }
            this.typeDialogue(`You refactored ${this.pip.name}'s syntax! Catch probability boosted to 95%!`, () => this.triggerEnemyTurn());
          }
        },
        {
          name: '* Console.log Debug',
          action: () => {
            sfx.playSelect();
            this.typeDialogue(`> console.log(${this.pip.name}): Status 200 OK. Memory leaks resolved!`, () => this.triggerEnemyTurn());
          }
        },
        {
          name: '* Share Chai Break',
          action: () => {
            sfx.playHeal();
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);
            this.updateHpUI();
            this.typeDialogue(`You shared warm chai with ${this.pip.name}! Restored 25 HP!`, () => this.triggerEnemyTurn());
          }
        }
      ];
      acts.forEach(a => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item-btn';
        btn.innerHTML = `<span class="sub-item-name">${a.name}</span>`;
        btn.addEventListener('click', a.action);
        grid.appendChild(btn);
      });
    } else if (category === 'item') {
      title.textContent = 'TRAINER BAG ITEMS:';
      const items = [
        { name: `Hot Espresso (+30 HP) [x${this.inventory.potions}]`, count: this.inventory.potions, heal: 30, use: () => this.inventory.potions-- },
        { name: `StackOverflow Elixir (+60 HP) [x${this.inventory.elixirs}]`, count: this.inventory.elixirs, heal: 60, use: () => this.inventory.elixirs-- },
        { name: `Rare Code Candy (+1 Lvl) [x${this.inventory.candies}]`, count: this.inventory.candies, heal: 0, lvl: true, use: () => this.inventory.candies-- }
      ];
      items.forEach(it => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item-btn';
        btn.innerHTML = `<span class="sub-item-name">🧪 ${it.name}</span>`;
        btn.addEventListener('click', () => {
          if (it.count <= 0) {
            showToast('Item depleted!');
            return;
          }
          it.use();
          sfx.playHeal();
          if (it.lvl) {
            this.player.level += 1;
            showToast(`Deepshikha reached Level ${this.player.level}!`);
          } else {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + it.heal);
          }
          this.updateHpUI();
          this.typeDialogue(`Deepshikha used an item from the bag!`, () => this.triggerEnemyTurn());
        });
        grid.appendChild(btn);
      });
    } else if (category === 'mercy') {
      title.textContent = 'CATCH OR ESCAPE:';
      const opts = [
        {
          name: `🔴 Throw Pip-Capsule (x${this.inventory.capsules})`,
          desc: 'Attempt to catch the wild Pip!',
          action: () => this.attemptCatch()
        },
        {
          name: '🏃 RUN / Flee to Open World',
          desc: 'Escape battle safely back to map',
          action: () => {
            sfx.playClick();
            this.closeSubmenu();
            this.typeDialogue('Got away safely!', () => {
              setTimeout(() => this.setMode('overworld'), 500);
            });
          }
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

  closeSubmenu() {
    sfx.playClick();
    const panel = document.getElementById('pip-submenu-panel');
    if (panel) panel.style.display = 'none';
  }

  executeAttack(move) {
    this.closeSubmenu();
    sfx.playAttack();

    const sprite = document.getElementById('enemy-sprite');
    if (sprite) {
      sprite.classList.add('arena-shake');
      setTimeout(() => sprite.classList.remove('arena-shake'), 400);
    }

    // Type effectiveness check
    let mult = 1.0;
    let effectMsg = '';
    if ((move.type === 'FIRE' && this.pip.type1 === 'GLITCH') ||
        (move.type === 'DATA' && this.pip.type1 === 'FIRE') ||
        (move.type === 'ELECTRIC' && this.pip.type1 === 'WATER')) {
      mult = 1.5;
      effectMsg = " It's super effective!";
    }

    const dealt = Math.round(move.dmg * mult);
    this.pip.hp = Math.max(0, this.pip.hp - dealt);
    this.updateHpUI();

    if (this.pip.hp <= 0) {
      sfx.playVictory();
      this.typeDialogue(`★ Incredible! Wild ${this.pip.name} was defeated! Earned 120 EXP!${effectMsg}`, () => {
        showToast(`Defeated ${this.pip.name}!`);
        setTimeout(() => this.setMode('overworld'), 2000);
      });
    } else {
      this.typeDialogue(`Deepshikha used ${move.name}! Dealt ${dealt} damage!${effectMsg}`, () => {
        this.triggerEnemyTurn();
      });
    }
  }

  attemptCatch() {
    this.closeSubmenu();
    if (this.inventory.capsules <= 0) {
      showToast('Out of Pip-Capsules! Find more in Route 1!');
      return;
    }
    this.inventory.capsules--;

    sfx.playSelect();
    const dialogue = document.getElementById('pip-dialogue-text');
    if (dialogue) {
      dialogue.innerHTML = `<span class="wobble-capsule">🔴</span> Deepshikha threw a Pip-Capsule...!`;
    }

    setTimeout(() => {
      sfx.playCapsuleWobble();
      if (dialogue) dialogue.innerHTML = `<span class="wobble-capsule">🔴</span> Wobble... (1)`;
    }, 800);

    setTimeout(() => {
      sfx.playCapsuleWobble();
      if (dialogue) dialogue.innerHTML = `<span class="wobble-capsule">🔴</span> Wobble... (2)`;
    }, 1600);

    setTimeout(() => {
      sfx.playCapsuleWobble();
      if (dialogue) dialogue.innerHTML = `<span class="wobble-capsule">🔴</span> Wobble... (3)`;
    }, 2400);

    setTimeout(() => {
      const catchRate = this.isRefactored ? 0.95 : (1 - this.pip.hp / this.pip.maxHp) * 0.85;
      const success = Math.random() < Math.max(0.4, catchRate) || this.pip.hp <= 35;

      if (success) {
        sfx.playVictory();
        this.isTamed = true;
        this.dex[this.currentSpeciesKey] = true; // Registered to Pip-Dex!
        this.updateHUD();

        const tag = document.getElementById('enemy-status-tag');
        if (tag) {
          tag.textContent = 'CAUGHT!';
          tag.style.backgroundColor = '#a3e635';
        }

        this.typeDialogue(`🎉 GOTCHA! Wild ${this.pip.name} was caught and registered to your Pip-Dex! ⭐`, () => {
          showToast(`Caught ${this.pip.name}! Added to Pip-Dex!`);
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

    this.typeDialogue(`What will PIP-MASTER DEEPSHIKHA do next?`);
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

      const card = document.createElement('div');
      card.className = `dex-card ${isCaught ? 'caught' : ''}`;
      card.innerHTML = `
        <span class="dex-card-num">${sp.id}</span>
        <img src="${sp.spriteSrc}" alt="${sp.name}" class="dex-card-img" style="filter: ${isCaught ? 'none' : 'brightness(0.3) grayscale(1)'};">
        <span class="dex-card-name">${isCaught ? sp.name : '???'}</span>
        <div class="dex-card-types">
          <span class="psc-badge ${sp.badgeClass}">${sp.type1}</span>
          <span class="psc-badge type-code">${sp.type2}</span>
        </div>
        <span class="dex-card-status ${isCaught ? 'caught' : 'wild'}">${isCaught ? '✓ CAUGHT' : 'UNKNOWN'}</span>
      `;
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
document.getElementById('icon-resume')?.addEventListener('click', () => openModal(resumeModal));
document.getElementById('quick-resume-btn-bar')?.addEventListener('click', () => openModal(resumeModal));

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

} // End of browser environment guard
