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
class RetroAudioEngine {
  constructor() {
    this.sfxEnabled = true;
    this.bgmEnabled = false;
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
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Undertale-inspired voice typewriter blip
  playBlip() {
    if (!this.sfxEnabled) return;
    const baseFreq = 220 + Math.random() * 80;
    this.playTone(baseFreq, 'square', 0.04, 0.05);
  }

  // Menu button click
  playClick() {
    this.playTone(520, 'triangle', 0.06, 0.08);
  }

  // Menu selection sound
  playSelect() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.audioCtx) return;
    const t = this.audioCtx.currentTime;
    this.playTone(440, 'triangle', 0.06, 0.07);
    setTimeout(() => this.playTone(880, 'triangle', 0.09, 0.07), 60);
  }

  // Battle encounter opening fanfare (Pokemon & Undertale fusion)
  playEncounter() {
    if (!this.sfxEnabled) return;
    const notes = [330, 392, 494, 587, 659, 784, 880, 988, 1175];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.08, 0.07);
      }, idx * 60);
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

  // Hurt damage sound (Undertale crunch hit)
  playHurt() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      // Noise buffer hit
      const bufferSize = this.audioCtx.sampleRate * 0.12;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);
      noise.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start();
    } catch (e) {}
  }

  // Healing chime
  playHeal() {
    if (!this.sfxEnabled) return;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.08), idx * 75);
    });
  }

  // Pip-Capsule wobble sound
  playCapsuleWobble() {
    this.playTone(300, 'triangle', 0.1, 0.09);
    setTimeout(() => this.playTone(450, 'triangle', 0.1, 0.09), 100);
  }

  // Victory Fanfare (When Pip is caught!)
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

  // Royalty-free 8-Bit Chiptune Adventure BGM Loop (Pokemon & Undertale Inspired)
  toggleBgm() {
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgmEnabled) {
      this.init();
      this.startBgmLoop();
    } else {
      this.stopBgmLoop();
    }
    return this.bgmEnabled;
  }

  startBgmLoop() {
    this.stopBgmLoop();
    // Catchy 16-step upbeat chiptune melody
    const melody = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 659.25, 698.46, 587.33,
      523.25, 659.25, 783.99, 1046.50,
      987.77, 783.99, 880.00, 783.99
    ];
    const bass = [
      130.81, 130.81, 164.81, 164.81,
      146.83, 146.83, 174.61, 174.61,
      130.81, 130.81, 196.00, 196.00,
      174.61, 174.61, 146.83, 196.00
    ];

    const stepDuration = 180; // ms per 16th beat
    this.bgmStep = 0;

    this.bgmTimer = setInterval(() => {
      if (!this.bgmEnabled || !this.audioCtx) return;
      try {
        const step = this.bgmStep % melody.length;
        // Melody voice (pulse/square)
        const oscM = this.audioCtx.createOscillator();
        const gainM = this.audioCtx.createGain();
        oscM.type = 'square';
        oscM.frequency.setValueAtTime(melody[step], this.audioCtx.currentTime);
        gainM.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        gainM.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.14);
        oscM.connect(gainM);
        gainM.connect(this.bgmMasterGain);
        oscM.start();
        oscM.stop(this.audioCtx.currentTime + 0.14);

        // Bass voice (triangle)
        const oscB = this.audioCtx.createOscillator();
        const gainB = this.audioCtx.createGain();
        oscB.type = 'triangle';
        oscB.frequency.setValueAtTime(bass[step], this.audioCtx.currentTime);
        gainB.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
        gainB.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.16);
        oscB.connect(gainB);
        gainB.connect(this.bgmMasterGain);
        oscB.start();
        oscB.stop(this.audioCtx.currentTime + 0.16);

        // Hi-hat / snare noise on beats
        if (step % 2 === 0) {
          const noiseBuffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.03, this.audioCtx.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.03;
          const noise = this.audioCtx.createBufferSource();
          noise.buffer = noiseBuffer;
          noise.connect(this.bgmMasterGain);
          noise.start();
        }

        this.bgmStep++;
      } catch (e) {}
    }, stepDuration);
  }

  stopBgmLoop() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
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

// Initial hash inspection on boot
const initialHash = location.hash.replace('#', '');
if (['about', 'works', 'game'].includes(initialHash)) {
  switchView(initialHash, false);
}


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

// Sound effects toggle
const soundBtn = document.getElementById('sound-toggle-btn');
const gameSoundBtn = document.getElementById('game-sound-toggle-btn');
const soundIcon = document.getElementById('sound-icon');
const gameSoundIcon = document.getElementById('game-sound-icon');

function toggleSound() {
  sfx.sfxEnabled = !sfx.sfxEnabled;
  const label = sfx.sfxEnabled ? '🔊 SFX' : '🔇 Muted';
  if (soundIcon) soundIcon.textContent = label;
  if (gameSoundIcon) gameSoundIcon.textContent = label;
  showToast(sfx.sfxEnabled ? 'Retro Sound Effects Enabled' : 'Sound Effects Muted');
}

soundBtn?.addEventListener('click', toggleSound);
gameSoundBtn?.addEventListener('click', toggleSound);

// Royalty-Free Chiptune Music toggle
const musicBtn = document.getElementById('music-toggle-btn');
const gameMusicBtn = document.getElementById('game-music-toggle-btn');

function handleBgmToggle() {
  const isPlaying = sfx.toggleBgm();
  const label = isPlaying ? '🎵 BGM: ON' : '🎵 BGM: OFF';
  [musicBtn, gameMusicBtn].forEach(btn => {
    if (btn) {
      btn.querySelector('span').textContent = label;
      btn.classList.toggle('active', isPlaying);
    }
  });
  showToast(isPlaying ? '8-Bit Chiptune Music Playing 🎶' : 'Music Paused');
}

musicBtn?.addEventListener('click', handleBgmToggle);
gameMusicBtn?.addEventListener('click', handleBgmToggle);


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
class CatchThatPipGame {
  constructor() {
    this.player = {
      name: 'DEEPSHIKHA',
      level: 28,
      hp: 100,
      maxHp: 100,
      x: 240,
      y: 90,
      speed: 4,
      size: 14
    };

    // Species Catalog
    this.speciesData = {
      flamechar: {
        name: 'FLAMECHAR',
        level: 28,
        hp: 85,
        maxHp: 85,
        type1: 'FIRE',
        type2: 'CODE',
        badgeClass: 'type-fire',
        spriteSrc: 'assets/flamechar_sprite.svg',
        greeting: 'Wild FLAMECHAR sparks with enthusiasm! Its tail flame crackles with Python bytecode!',
        inspect: 'FLAMECHAR: Fire/Code Pip! Known for fiery performance. Weak to clean formatting and iced chai.',
        bulletType: 'fire'
      },
      bulbasprout: {
        name: 'BULBASPROUT',
        level: 28,
        hp: 90,
        maxHp: 90,
        type1: 'DATA',
        type2: 'GRASS',
        badgeClass: 'type-trainer',
        spriteSrc: 'assets/bulbasprout_sprite.svg',
        greeting: 'Wild BULBASPROUT emerged from the Pandas DataFrame! It wields data decision trees!',
        inspect: 'BULBASPROUT: Data/Tree Pip! Grows rapidly with clean SQL tables and Tableau charts.',
        bulletType: 'data'
      },
      buggypip: {
        name: 'BUGGYPIP',
        level: 28,
        hp: 75,
        maxHp: 75,
        type1: 'GLITCH',
        type2: 'CYBER',
        badgeClass: 'type-glitch',
        spriteSrc: 'assets/buggypip_sprite.svg',
        greeting: 'Wild BUGGYPIP threatens production release! "Uncaught TypeError at index.js:42"!',
        inspect: 'BUGGYPIP: Glitch Pip! Feeds on missing semicolons. Can be pacified by Refactoring Code.',
        bulletType: 'glitch'
      }
    };

    this.currentSpeciesKey = 'flamechar';
    this.pip = null;
    this.isRefactored = false;
    this.isTamed = false;
    this.isDodging = false;
    this.dodgeTimeLeft = 0;
    this.dodgeInterval = null;
    this.bullets = [];

    this.keys = {};
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.pfpImage = null;

    this.initDOM();
  }

  initDOM() {
    this.canvas = document.getElementById('pip-dodge-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    // Preload trainer avatar for soul rendering in canvas
    this.pfpImage = new Image();
    this.pfpImage.src = 'assets/profile.jpg';

    // Action Command Buttons
    document.getElementById('btn-pip-fight')?.addEventListener('click', () => this.openSubmenu('fight'));
    document.getElementById('btn-pip-act')?.addEventListener('click', () => this.openSubmenu('act'));
    document.getElementById('btn-pip-item')?.addEventListener('click', () => this.openSubmenu('item'));
    document.getElementById('btn-pip-mercy')?.addEventListener('click', () => this.openSubmenu('mercy'));
    document.getElementById('submenu-back-btn')?.addEventListener('click', () => this.closeSubmenu());

    // Wild Pip Switcher Buttons
    document.querySelectorAll('.pip-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const species = btn.getAttribute('data-pip');
        document.querySelectorAll('.pip-switch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectSpecies(species);
      });
    });

    // Keyboard Dodging Controls (Arrow Keys & WASD)
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        if (this.isDodging) e.preventDefault();
      }
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Mobile Touch D-Pad
    document.querySelectorAll('.dpad-btn').forEach(btn => {
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
  }

  selectSpecies(speciesKey) {
    sfx.playSelect();
    this.currentSpeciesKey = speciesKey;
    const data = this.speciesData[speciesKey];
    this.pip = { ...data };
    this.isRefactored = false;
    this.isTamed = false;

    // Update Stage UI
    const nameEl = document.getElementById('enemy-pip-name');
    const badge1 = document.getElementById('enemy-type-badge-1');
    const badge2 = document.getElementById('enemy-type-badge-2');
    const statusTag = document.getElementById('enemy-status-tag');
    const balloon = document.getElementById('enemy-speech-balloon');
    const mascotImg = document.getElementById('enemy-mascot-img');

    if (nameEl) nameEl.textContent = this.pip.name;
    if (badge1) {
      badge1.textContent = this.pip.type1;
      badge1.className = `psc-badge ${this.pip.badgeClass}`;
    }
    if (badge2) badge2.textContent = this.pip.type2;
    if (statusTag) {
      statusTag.textContent = 'WILD';
      statusTag.style.backgroundColor = '#fef08a';
    }
    if (balloon) balloon.innerHTML = `<span>"${this.pip.greeting}"</span>`;
    if (mascotImg && this.pip.spriteSrc) {
      mascotImg.src = this.pip.spriteSrc;
      mascotImg.alt = this.pip.name;
    }

    this.updateHpUI();
    this.typeDialogue(this.pip.greeting);
  }

  onEnter() {
    this.selectSpecies(this.currentSpeciesKey);
    sfx.playEncounter();
  }

  onLeave() {
    this.stopDodging();
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
    }, 22);
  }

  updateHpUI() {
    // Enemy HP
    const enemyFill = document.getElementById('enemy-hp-fill');
    const enemyText = document.getElementById('enemy-hp-text');
    if (enemyFill && enemyText && this.pip) {
      const pct = Math.max(0, Math.min(100, (this.pip.hp / this.pip.maxHp) * 100));
      enemyFill.style.width = `${pct}%`;
      enemyFill.style.backgroundColor = pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444';
      enemyText.textContent = `${this.pip.hp} / ${this.pip.maxHp}`;
    }

    // Player HP
    const playerFill = document.getElementById('player-hp-fill');
    const playerText = document.getElementById('player-hp-text');
    if (playerFill && playerText) {
      const pct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
      playerFill.style.width = `${pct}%`;
      playerFill.style.backgroundColor = pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444';
      playerText.textContent = `${this.player.hp} / ${this.player.maxHp}`;
    }
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
      title.textContent = 'CHOOSE A CODE ATTACK:';
      const moves = [
        { name: 'Code Strike', desc: 'Direct logic pulse (25 DMG)', dmg: 25 },
        { name: 'Python Whip', desc: 'Fast vectorized slice (35 DMG)', dmg: 35 },
        { name: 'SQL Query Blast', desc: 'Heavy indexed query (45 DMG)', dmg: 45 },
        { name: 'Git Hotfix', desc: 'Critical deploy strike (55 DMG)', dmg: 55 }
      ];
      moves.forEach(m => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item-btn';
        btn.innerHTML = `<span class="sub-item-name">⚔ ${m.name}</span><span class="sub-item-meta">${m.desc}</span>`;
        btn.addEventListener('click', () => this.executeAttack(m));
        grid.appendChild(btn);
      });
    } else if (category === 'act') {
      title.textContent = 'COMMUNE & INTERACT WITH PIP:';
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
            this.typeDialogue(`You refactored ${this.pip.name}'s loops! Its rage pacified by 50%!`, () => this.triggerEnemyTurn());
          }
        },
        {
          name: '* Console.log()',
          action: () => {
            sfx.playSelect();
            this.typeDialogue(`> console.log(${this.pip.name}): Status 200 OK. Memory leak resolved!`, () => this.triggerEnemyTurn());
          }
        },
        {
          name: '* Share Coffee Break',
          action: () => {
            sfx.playHeal();
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);
            this.updateHpUI();
            this.typeDialogue(`You enjoyed warm chai with ${this.pip.name}! Restored 25 HP!`, () => this.triggerEnemyTurn());
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
      title.textContent = 'PIP-BAG INVENTORY:';
      const items = [
        { name: 'Hot Espresso (+30 HP)', heal: 30 },
        { name: 'Stack Overflow Elixir (+60 HP)', heal: 60 },
        { name: 'Git Revert Serum (+25 HP)', heal: 25 },
        { name: 'Poké-Patch (+45 HP)', heal: 45 }
      ];
      items.forEach(it => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item-btn';
        btn.innerHTML = `<span class="sub-item-name">🧪 ${it.name}</span>`;
        btn.addEventListener('click', () => {
          sfx.playHeal();
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + it.heal);
          this.updateHpUI();
          this.typeDialogue(`Deepshikha used ${it.name}! Restored ${it.heal} HP!`, () => this.triggerEnemyTurn());
        });
        grid.appendChild(btn);
      });
    } else if (category === 'mercy') {
      title.textContent = 'CATCH OR SPARE:';
      const options = [
        {
          name: '🔴 Throw Pip-Capsule',
          desc: 'Attempt to catch the wild Pip!',
          action: () => this.attemptCatch()
        },
        {
          name: '💛 Spare Pip',
          desc: 'Spare the tamed Pip peacefully',
          action: () => {
            if (this.isRefactored || this.pip.hp <= 35) {
              sfx.playVictory();
              this.typeDialogue(`★ Deepshikha spared ${this.pip.name}! The encounter ended with pure harmony!`, () => {
                showToast(`Spared ${this.pip.name} successfully!`);
              });
            } else {
              this.typeDialogue(`${this.pip.name} is not ready to be spared yet! Try Refactoring first!`, () => this.triggerEnemyTurn());
            }
          }
        },
        {
          name: '🏃 Flee / Escape',
          desc: 'Retreat safely to Desktop OS',
          action: () => {
            sfx.playClick();
            switchView('desktop');
            showToast('Safely escaped from the wild Pip!');
          }
        }
      ];
      options.forEach(o => {
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
    // Shake enemy sprite
    const sprite = document.getElementById('enemy-sprite');
    if (sprite) {
      sprite.classList.add('arena-shake');
      setTimeout(() => sprite.classList.remove('arena-shake'), 400);
    }

    this.pip.hp = Math.max(0, this.pip.hp - move.dmg);
    this.updateHpUI();

    if (this.pip.hp <= 0) {
      sfx.playVictory();
      this.typeDialogue(`★ Incredible! ${this.pip.name} was defeated and debugged into main branch!`, () => {
        showToast(`Defeated ${this.pip.name}!`);
      });
    } else {
      this.typeDialogue(`Deepshikha used ${move.name}! Dealt ${move.dmg} damage!`, () => {
        this.triggerEnemyTurn();
      });
    }
  }

  attemptCatch() {
    this.closeSubmenu();
    sfx.playSelect();
    const dialogue = document.getElementById('pip-dialogue-text');
    if (dialogue) {
      dialogue.innerHTML = `<span class="wobble-capsule">🔴</span> Deepshikha threw a Pip-Capsule...!`;
    }

    // Wobble sequence
    setTimeout(() => {
      sfx.playCapsuleWobble();
      if (dialogue) dialogue.innerHTML = `<span class="wobble-capsule">🔴</span> Wobble... (1)`;
    }, 900);

    setTimeout(() => {
      sfx.playCapsuleWobble();
      if (dialogue) dialogue.innerHTML = `<span class="wobble-capsule">🔴</span> Wobble... (2)`;
    }, 1800);

    setTimeout(() => {
      sfx.playCapsuleWobble();
      if (dialogue) dialogue.innerHTML = `<span class="wobble-capsule">🔴</span> Wobble... (3)`;
    }, 2700);

    setTimeout(() => {
      const catchRate = this.isRefactored ? 0.95 : (1 - this.pip.hp / this.pip.maxHp) * 0.9;
      const success = Math.random() < Math.max(0.4, catchRate);

      if (success || this.pip.hp <= 35) {
        sfx.playVictory();
        this.isTamed = true;
        const tag = document.getElementById('enemy-status-tag');
        if (tag) {
          tag.textContent = 'CAUGHT!';
          tag.style.backgroundColor = '#a3e635';
        }
        this.typeDialogue(`🎉 GOTCHA! Wild ${this.pip.name} was caught and registered to your Pip-Dex! ⭐`, () => {
          showToast(`Caught ${this.pip.name}! Added to collection!`);
        });
      } else {
        sfx.playHurt();
        this.typeDialogue(`Oh no! ${this.pip.name} broke free from the Pip-Capsule!`, () => {
          this.triggerEnemyTurn();
        });
      }
    }, 3600);
  }

  // ========================================================
  // UNDERTALE CANVAS BULLET HELL DODGING PHASE (ENEMY TURN)
  // ========================================================
  triggerEnemyTurn() {
    this.closeSubmenu();
    const dialogueSection = document.getElementById('pip-dialogue-section');
    const dodgeSection = document.getElementById('pip-dodging-section');
    const timerBadge = document.getElementById('dodge-timer-badge');

    if (dialogueSection) dialogueSection.style.display = 'none';
    if (dodgeSection) dodgeSection.style.display = 'flex';

    this.isDodging = true;
    this.dodgeTimeLeft = 5.0; // 5 seconds dodging round
    this.player.x = 260;
    this.player.y = 95;
    this.bullets = [];

    // Spawn bullets based on Pip type
    this.spawnBullets();

    // Start dodge timer countdown
    clearInterval(this.dodgeInterval);
    this.dodgeInterval = setInterval(() => {
      this.dodgeTimeLeft -= 0.1;
      if (timerBadge) {
        timerBadge.textContent = `TIME: ${Math.max(0, this.dodgeTimeLeft).toFixed(1)}s`;
      }
      if (this.dodgeTimeLeft <= 0) {
        this.stopDodging();
      }
    }, 100);

    this.startCanvasLoop();
  }

  spawnBullets() {
    const count = 18;
    const bType = this.pip?.bulletType || 'fire';

    for (let i = 0; i < count; i++) {
      this.bullets.push({
        x: Math.random() * 520,
        y: -10 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 2.5,
        vy: 1.8 + Math.random() * 2.2,
        size: 8 + Math.random() * 6,
        type: bType,
        angle: Math.random() * Math.PI * 2
      });
    }
  }

  stopDodging() {
    this.isDodging = false;
    clearInterval(this.dodgeInterval);
    cancelAnimationFrame(this.animationFrame);

    const dialogueSection = document.getElementById('pip-dialogue-section');
    const dodgeSection = document.getElementById('pip-dodging-section');

    if (dodgeSection) dodgeSection.style.display = 'none';
    if (dialogueSection) dialogueSection.style.display = 'flex';

    this.typeDialogue(`What will PIP-MASTER DEEPSHIKHA do next?`);
  }

  startCanvasLoop() {
    const loop = () => {
      if (!this.isDodging || !this.ctx) return;
      this.updateCanvasPhysics();
      this.drawCanvas();
      this.animationFrame = requestAnimationFrame(loop);
    };
    this.animationFrame = requestAnimationFrame(loop);
  }

  updateCanvasPhysics() {
    // Player movement via WASD or Arrow Keys
    const p = this.player;
    if (this.keys['arrowup'] || this.keys['w'] || this.keys['up']) p.y -= p.speed;
    if (this.keys['arrowdown'] || this.keys['s'] || this.keys['down']) p.y += p.speed;
    if (this.keys['arrowleft'] || this.keys['a'] || this.keys['left']) p.x -= p.speed;
    if (this.keys['arrowright'] || this.keys['d'] || this.keys['right']) p.x += p.speed;

    // Boundary constraints
    const pad = p.size;
    p.x = Math.max(pad, Math.min(520 - pad, p.x));
    p.y = Math.max(pad, Math.min(190 - pad, p.y));

    // Bullets update & collision
    this.bullets.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.angle += 0.05;

      // Recycle bullet when falling off-screen
      if (b.y > 200) {
        b.y = -10;
        b.x = Math.random() * 520;
      }

      // Check distance to player
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < p.size + b.size * 0.6) {
        // Player hit!
        sfx.playHurt();
        this.player.hp = Math.max(0, this.player.hp - 2);
        this.updateHpUI();
        // Displace bullet
        b.y = 220;

        // Arena shake visual feedback
        const arena = document.getElementById('pip-dodging-section');
        if (arena) {
          arena.classList.add('arena-shake');
          setTimeout(() => arena.classList.remove('arena-shake'), 250);
        }
      }
    });
  }

  drawCanvas() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 520, 190);

    // Subtle dark matrix grid background
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1;
    for (let x = 0; x < 520; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 190);
      ctx.stroke();
    }
    for (let y = 0; y < 190; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(520, y);
      ctx.stroke();
    }

    // Draw Bullets (Flame embers, code brackets, or glitch bugs)
    this.bullets.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      if (b.type === 'fire') {
        // Fiery Ember bullet
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, b.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, 0, b.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'data') {
        // Floating code bracket '{ }' or semicolon ';'
        ctx.font = `bold ${b.size * 1.5}px monospace`;
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(';', 0, 0);
      } else {
        // Glitch bug particle
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size);
      }
      ctx.restore();
    });

    // Draw Player Character / Soul in Canvas
    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);

    // Glowing Undertale Soul Heart Halo around player's mini avatar
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, p.size + 4, 0, Math.PI * 2);
    ctx.fill();

    // Clip and draw Deepshikha's mini pixel avatar inside the heart circle!
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.clip();
    if (this.pfpImage && this.pfpImage.complete) {
      ctx.drawImage(this.pfpImage, -p.size, -p.size, p.size * 2, p.size * 2);
    } else {
      ctx.fillStyle = '#f4d06f';
      ctx.fill();
    }
    ctx.restore();
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

// Tableau / Telemetry pill button on desktop
document.getElementById('open-tableau-pill')?.addEventListener('click', () => {
  sfx.playClick();
  switchView('desktop');
  const winWorks = document.getElementById('window-works');
  if (winWorks) winWorks.style.display = 'block';
  tabButtons.forEach(b => b.classList.remove('active'));
  tabPanes.forEach(p => p.classList.remove('active'));
  const telemetryTabBtn = document.querySelector('.win-tab-btn[data-tab="telemetry"]');
  const telemetryPane = document.getElementById('tab-telemetry');
  telemetryTabBtn?.classList.add('active');
  telemetryPane?.classList.add('active');
});

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
