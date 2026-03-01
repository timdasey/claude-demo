import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, HANDLE_EMAIL_DOMAIN } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Redirect if already logged in
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) window.location.replace('app.html');
});

// ── Helpers ────────────────────────────────────────────────

/** Convert a handle into the internal email Supabase uses */
function handleToEmail(handle) {
  return `${handle.toLowerCase()}@${HANDLE_EMAIL_DOMAIN}`;
}

function validateHandle(handle) {
  if (!handle) return 'Handle is required.';
  if (!/^[a-zA-Z0-9_]+$/.test(handle)) return 'Only letters, numbers, and underscores.';
  if (handle.length > 30) return 'Handle must be 30 characters or fewer.';
  return null;
}

function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.classList.add('visible');
}

function clearError(elementId) {
  const el = document.getElementById(elementId);
  el.textContent = '';
  el.classList.remove('visible');
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  const label = btn.querySelector('.btn-label');
  const spinner = btn.querySelector('.btn-spinner');
  btn.disabled = loading;
  label.classList.toggle('hidden', loading);
  spinner.classList.toggle('hidden', !loading);
}

// ── Tab switching ──────────────────────────────────────────

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === target);
      t.setAttribute('aria-selected', t.dataset.tab === target);
    });

    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `panel-${target}`);
    });
  });
});

// ── Password visibility toggle ─────────────────────────────

document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.querySelector('.icon-eye').classList.toggle('hidden', isHidden);
    btn.querySelector('.icon-eye-off').classList.toggle('hidden', !isHidden);
    btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });
});

// ── Login ──────────────────────────────────────────────────

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError('login-error');

  const handle = e.target.handle.value.trim();
  const password = e.target.password.value;

  const handleErr = validateHandle(handle);
  if (handleErr) { showError('login-error', handleErr); return; }
  const passErr = validatePassword(password);
  if (passErr) { showError('login-error', passErr); return; }

  setLoading('login-submit', true);

  const { error } = await supabase.auth.signInWithPassword({
    email: handleToEmail(handle),
    password,
  });

  setLoading('login-submit', false);

  if (error) {
    // Map Supabase error messages to user-friendly ones
    if (error.message.includes('Invalid login credentials')) {
      showError('login-error', 'Incorrect handle or password.');
    } else {
      showError('login-error', error.message);
    }
    return;
  }

  window.location.replace('app.html');
});

// ── Sign up ────────────────────────────────────────────────

document.getElementById('form-signup').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError('signup-error');

  const handle = e.target.handle.value.trim();
  const password = e.target.password.value;

  const handleErr = validateHandle(handle);
  if (handleErr) { showError('signup-error', handleErr); return; }
  const passErr = validatePassword(password);
  if (passErr) { showError('signup-error', passErr); return; }

  setLoading('signup-submit', true);

  const { error } = await supabase.auth.signUp({
    email: handleToEmail(handle),
    password,
    options: {
      data: { handle },              // stored in raw_user_meta_data
      emailRedirectTo: undefined,    // no email confirmation flow
    },
  });

  setLoading('signup-submit', false);

  if (error) {
    if (error.message.includes('User already registered')) {
      showError('signup-error', 'That handle is already taken.');
    } else {
      showError('signup-error', error.message);
    }
    return;
  }

  // With email confirmation disabled in Supabase, the user is signed in immediately.
  window.location.replace('app.html');
});
