document.addEventListener('DOMContentLoaded', () => {

  // ── Typing Effect ──
  const PHRASES = [
    'Share files. Save the planet.',
    'Encrypted. Sustainable. Trusted.',
    'Your circle. Your privacy.',
    'Green sharing for a greener future.',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typedEl = document.getElementById('typed');

  function type() {
    if (!typedEl) return; // prevents crash if element missing

    const current = PHRASES[phraseIndex];

    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }

    typedEl.textContent = current.substring(0, charIndex);

    let delay = isDeleting ? 50 : 90;

    if (!isDeleting && charIndex === current.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % PHRASES.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  type();


  // ── Notify Form ──
  async function submitNotify() {
    const emailInput = document.getElementById('emailInput');
    const errorEl = document.getElementById('notifyError');
    const successEl = document.getElementById('notifySuccess');
    const formEl = document.getElementById('notifyForm');

    if (!emailInput) return;

    const email = emailInput.value.trim();
    errorEl.textContent = '';

    if (!email || !email.includes('@')) {
      errorEl.textContent = 'Please enter a valid email address.';
      return;
    }

    try {
      // ⚠️ If no backend, simulate success
      const fakeSuccess = true;

      if (fakeSuccess) {
        formEl.style.display = 'none';
        successEl.style.display = 'flex';
        return;
      }

      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        formEl.style.display = 'none';
        successEl.style.display = 'flex';
      } else {
        errorEl.textContent = data.message || 'Something went wrong.';
      }

    } catch {
      errorEl.textContent = 'Network error. Please try again.';
    }
  }

  // Attach to button (important!)
  const form = document.getElementById('notifyForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitNotify();
    });
  }

  // Enter key support
  const emailInput = document.getElementById('emailInput');
  if (emailInput) {
    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitNotify();
      }
    });
  }

});