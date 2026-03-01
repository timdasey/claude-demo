import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Guard: redirect to auth if not logged in
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  window.location.replace('auth.html');
}

const handle = session.user.user_metadata?.handle ?? session.user.email.split('@')[0];
document.getElementById('user-handle').textContent = `@${handle}`;
document.getElementById('welcome-handle').textContent = `@${handle}`;

document.getElementById('btn-logout').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.replace('auth.html');
});
