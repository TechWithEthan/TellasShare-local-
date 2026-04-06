// ===== CONFIG =====
const LAUNCH_DATE = new Date(2027, 8, 1, 23, 3, 0); // Sept 1, 2027

// ===== STATE =====
const state = { days: -1, hours: -1, mins: -1, secs: -1 };

function pad(n) { return String(n).padStart(2, '00'); }

// ===== BUILD DOM =====
function buildUnits() {
  const container = document.getElementById('cdUnits');
  const units = [
    { id: 'days',  label: 'Days' },
    { id: 'hours', label: 'Hours' },
    { id: 'mins',  label: 'Minutes' },
    { id: 'secs',  label: 'Seconds' },
  ];

  units.forEach((u, i) => {
    if (i > 0) {
      const sep = document.createElement('div');
      sep.className = 'cd-sep';
      sep.textContent = ':';
      container.appendChild(sep);
    }

    const unit = document.createElement('div');
    unit.className = 'cd-unit';

    const box = document.createElement('div');
    box.className = 'cd-box';

    const track = document.createElement('div');
    track.className = 'cd-track';
    track.id = 'track-' + u.id;

    // two digits stacked — current on top
    for (let j = 0; j < 2; j++) {
      const d = document.createElement('div');
      d.className = 'cd-digit';
      d.textContent = '00';
      track.appendChild(d);
    }

    track.style.transform = 'translateY(0)';
    track.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';

    box.appendChild(track);

    const label = document.createElement('div');
    label.className = 'cd-label';
    label.textContent = u.label;

    unit.appendChild(box);
    unit.appendChild(label);
    container.appendChild(unit);
  });
}

// ===== FLIP ANIMATION =====
function flipTo(id, val) {
  const track = document.getElementById('track-' + id);
  if (!track) return;

  const padded = pad(val);
  if (track.children[0] && track.children[0].textContent === padded) return;

  // append new digit below
  const next = document.createElement('div');
  next.className = 'cd-digit';
  next.textContent = padded;
  track.appendChild(next);

  // slide up (double rAF ensures browser has painted the new node)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      track.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
      track.style.transform = 'translateY(-88px)';
    });
  });

  // after slide finishes: snap back, drop old digit
  setTimeout(() => {
    track.style.transition = 'none';
    track.style.transform = 'translateY(0)';
    if (track.firstChild) track.removeChild(track.firstChild);
    requestAnimationFrame(() => {
      track.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  }, 460);
}

// ===== UPDATE COUNTDOWN =====
function update() {
  const diff = LAUNCH_DATE - new Date();

  if (diff <= 0) {
    document.getElementById('cdUnits').innerHTML =
      '<div class="cd-launched">🚀 We\'ve Launched!</div>';
    clearInterval(timer);
    return;
  }

  let r = diff;
  const days  = Math.floor(r / 86400000); r %= 86400000;
  const hours = Math.floor(r / 3600000);  r %= 3600000;
  const mins  = Math.floor(r / 60000);    r %= 60000;
  const secs  = Math.floor(r / 1000);

  if (state.days  !== days)  { flipTo('days',  days);  state.days  = days;  }
  if (state.hours !== hours) { flipTo('hours', hours); state.hours = hours; }
  if (state.mins  !== mins)  { flipTo('mins',  mins);  state.mins  = mins;  }
  if (state.secs  !== secs)  { flipTo('secs',  secs);  state.secs  = secs;  }
}

// ===== INIT COUNTDOWN =====
buildUnits();
update();
const timer = setInterval(update, 1000);

// ===== TYPING EFFECT =====
const PHRASES = [
  'Share files. Save the planet.',
  'Encrypted. Sustainable. Trusted.',
  'Your circle. Your privacy.',
  'Green sharing for a greener future.',
];

let phraseIndex = 0, charIndex = 0, isDeleting = false;
const typedEl = document.getElementById('typed');

function type() {
  const current = PHRASES[phraseIndex];
  typedEl.textContent = isDeleting
    ? current.slice(0, --charIndex)
    : current.slice(0, ++charIndex);

  let delay = isDeleting ? 50 : 90;

  if (!isDeleting && charIndex === current.length) {
    delay = 2000; isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % PHRASES.length;
    delay = 400;
  }
  setTimeout(type, delay);
}
type();

// ===== NOTIFY FORM =====
async function submitNotify() {
  const emailInput = document.getElementById('emailInput');
  const errorEl    = document.getElementById('notifyError');
  const successEl  = document.getElementById('notifySuccess');
  const formEl     = document.getElementById('notifyForm');
  const email      = emailInput.value.trim();

  errorEl.textContent = '';

  if (!email || !email.includes('@')) {
    errorEl.textContent = 'Please enter a valid email address.';
    return;
  }

  try {
    const res  = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      formEl.style.display    = 'none';
      successEl.style.display = 'flex';
    } else {
      errorEl.textContent = data.message || 'Something went wrong.';
    }
  } catch {
    errorEl.textContent = 'Network error. Please try again.';
  }
}

document.getElementById('emailInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitNotify();
});
