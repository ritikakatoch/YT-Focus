// Mode presets — what each mode hides
const MODES = {
  focus: {
    homeFeed: true, shorts: true, sidebar: true,
    comments: true, autoplay: true, counts: false,
    endCards: true, subscriberCount: false,
    ads: true, notifications: true, leftNav: true
  },
  browse: {
    homeFeed: false, shorts: false, sidebar: false,
    comments: false, autoplay: false, counts: false,
    endCards: false, subscriberCount: false,
    ads: true, notifications: false, leftNav: false
  },
  zen: {
    homeFeed: true, shorts: true, sidebar: true,
    comments: true, autoplay: true, counts: true,
    endCards: true, subscriberCount: true,
    ads: true, notifications: true, leftNav: true
  }
};

const MODE_LABELS = { focus: 'Focus mode', browse: 'Browse mode', zen: 'Zen mode', custom: 'Custom' };

let settings = {
  enabled: true,
  mode: 'focus',
  toggles: { ...MODES.focus }
};

// ── Save & broadcast ──────────────────────────────────────
function save() {
  chrome.runtime.sendMessage({ type: 'SET_SETTINGS', settings });
  renderUI();
}

// ── Render UI from settings state ─────────────────────────
function renderUI() {
  // Power button
  const btn = document.getElementById('powerBtn');
  if (settings.enabled) btn.classList.add('active');
  else btn.classList.remove('active');

  // Paused message
  document.getElementById('pausedMsg').classList.toggle('show', !settings.enabled);

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === settings.mode);
  });

  // Toggles
  document.querySelectorAll('[data-key]').forEach(input => {
    input.checked = !!settings.toggles[input.dataset.key];
  });

  // Footer count
  const count = Object.values(settings.toggles).filter(Boolean).length;
  document.getElementById('countNum').textContent = count;
  document.getElementById('modeLabel').textContent = MODE_LABELS[settings.mode] || 'Custom';
}

// ── Power button ──────────────────────────────────────────
document.getElementById('powerBtn').addEventListener('click', () => {
  settings.enabled = !settings.enabled;
  save();
});

// ── Mode buttons ──────────────────────────────────────────
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    settings.mode = mode;
    settings.toggles = { ...MODES[mode] };
    save();
  });
});

// ── Individual toggles ────────────────────────────────────
document.querySelectorAll('[data-key]').forEach(input => {
  input.addEventListener('change', () => {
    settings.toggles[input.dataset.key] = input.checked;
    settings.mode = 'custom'; // break out of preset
    save();
  });
});

// ── Clear all ─────────────────────────────────────────────
document.getElementById('clearBtn').addEventListener('click', () => {
  Object.keys(settings.toggles).forEach(k => settings.toggles[k] = false);
  settings.mode = 'custom';
  save();
});

// ── Load on open ─────────────────────────────────────────
chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (s) => {
  if (s) settings = s;
  renderUI();
});
