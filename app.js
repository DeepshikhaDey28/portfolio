/**
 * Deepshikha Dey - Portfolio & About Me Interactive Scripts
 * Handles retro OS desktop, window management, audio synth, and view transitions.
 */

// ==========================================
// AUDIO SYNTHESIZER (Web Audio API Retro Sfx)
// ==========================================
class RetroAudio {
  constructor() {
    this.enabled = true;
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playOpen() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, this.audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

const sfx = new RetroAudio();

// ==========================================
// VIEW NAVIGATION (DESKTOP <-> ABOUT ME)
// ==========================================
const desktopView = document.getElementById('desktop-view');
const aboutView = document.getElementById('about-view');

function showAboutView() {
  sfx.playOpen();
  desktopView.classList.remove('active');
  aboutView.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.pushState({ view: 'about' }, 'About Me - Deepshikha Dey', '#about');
}

function showDesktopView() {
  sfx.playClick();
  aboutView.classList.remove('active');
  desktopView.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.pushState({ view: 'desktop' }, 'Portfolio - Deepshikha Dey', '#desktop');
}

// Event Listeners for View Switching
document.getElementById('icon-profile')?.addEventListener('click', showAboutView);
document.getElementById('win-about-open-btn')?.addEventListener('click', showAboutView);
document.getElementById('view-about-top-btn')?.addEventListener('click', showAboutView);
document.getElementById('quick-about-btn')?.addEventListener('click', showAboutView);

document.getElementById('back-to-desktop-btn')?.addEventListener('click', showDesktopView);
document.getElementById('bottom-back-btn')?.addEventListener('click', showDesktopView);

// Handle Browser Back / Forward buttons
window.addEventListener('popstate', (e) => {
  if (location.hash === '#about') {
    desktopView.classList.remove('active');
    aboutView.classList.add('active');
  } else {
    aboutView.classList.remove('active');
    desktopView.classList.add('active');
  }
});

// Check Initial Hash on page load
if (window.location.hash === '#about') {
  desktopView.classList.remove('active');
  aboutView.classList.add('active');
}

// ==========================================
// MODAL MANAGEMENT (CONTACT & RESUME)
// ==========================================
const contactModal = document.getElementById('contact-modal');
const resumeModal = document.getElementById('resume-modal');

function openModal(modal) {
  sfx.playOpen();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  sfx.playClick();
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Close buttons inside modals
document.querySelectorAll('.close-modal-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.retro-modal-overlay');
    if (modal) closeModal(modal);
  });
});

// Click outside modal content to close
[contactModal, resumeModal].forEach(modal => {
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
});

// Desktop Folder Clicks for Modals
document.getElementById('icon-contact')?.addEventListener('click', () => openModal(contactModal));
document.getElementById('quick-contact-pill')?.addEventListener('click', () => openModal(contactModal));

document.getElementById('icon-resume')?.addEventListener('click', () => openModal(resumeModal));
document.getElementById('quick-resume-btn-bar')?.addEventListener('click', () => openModal(resumeModal));

// Toggle between Formatted HTML Resume and Embedded PDF
const toggleResumeFormatBtn = document.getElementById('toggle-resume-format-btn');
const resumeFormattedView = document.getElementById('resume-formatted-view');
const resumePdfView = document.getElementById('resume-pdf-view');

toggleResumeFormatBtn?.addEventListener('click', () => {
  sfx.playClick();
  if (resumeFormattedView.style.display === 'none') {
    resumeFormattedView.style.display = 'block';
    resumePdfView.style.display = 'none';
  } else {
    resumeFormattedView.style.display = 'none';
    resumePdfView.style.display = 'block';
  }
});

// ==========================================
// WORKS WINDOW MANAGEMENT & TABS
// ==========================================
const windowWorks = document.getElementById('window-works');
const iconWorks = document.getElementById('icon-works');

iconWorks?.addEventListener('click', () => {
  sfx.playClick();
  windowWorks.style.display = 'block';
  const body = windowWorks.querySelector('.works-body');
  if (body) body.style.display = 'block';
  windowWorks.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.getElementById('win-quick-works-btn')?.addEventListener('click', () => {
  sfx.playClick();
  windowWorks.style.display = 'block';
  windowWorks.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Tab navigation inside C:\DEEPSHIKHA\works
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

// Tableau pill in social bar opens Telemetry / BI tab directly
document.getElementById('open-tableau-pill')?.addEventListener('click', () => {
  sfx.playClick();
  windowWorks.style.display = 'block';
  const telemetryTabBtn = document.querySelector('.win-tab-btn[data-tab="telemetry"]');
  telemetryTabBtn?.click();
  windowWorks.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Window Titlebar Minimize / Close Actions
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

// ==========================================
// CLIPBOARD COPY WITH TOAST NOTIFICATION
// ==========================================
const toast = document.getElementById('toast-notification');
let toastTimer = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const textToCopy = btn.getAttribute('data-copy');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        sfx.playClick();
        showToast('Copied ' + textToCopy + ' to clipboard!');
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    }
  });
});

// ==========================================
// SOUND TOGGLE & LIVE OS CLOCK
// ==========================================
const soundBtn = document.getElementById('sound-toggle-btn');
const soundIcon = document.getElementById('sound-icon');

soundBtn?.addEventListener('click', () => {
  sfx.enabled = !sfx.enabled;
  if (soundIcon) {
    soundIcon.textContent = sfx.enabled ? '🔊' : '🔇';
  }
  showToast(sfx.enabled ? 'Sound Effects Enabled' : 'Sound Effects Muted');
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

// Avatar click toggle between Illustrated and GitHub photo
document.querySelectorAll('.avatar-toggleable').forEach(img => {
  img.addEventListener('click', () => {
    sfx.playClick();
    const isSvg = img.src.includes('illustrative_avatar.svg');
    const newSrc = isSvg ? 'assets/avatar.png' : 'assets/illustrative_avatar.svg';
    document.querySelectorAll('.avatar-toggleable').forEach(el => {
      el.src = newSrc;
    });
    showToast(isSvg ? 'Switched to GitHub Avatar' : 'Switched to Illustrated Avatar');
  });
});
