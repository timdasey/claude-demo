// Supabase project credentials
// Replace these with your actual values from:
// https://supabase.com/dashboard/project/<your-project>/settings/api
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// The email domain used internally to map handles to Supabase accounts.
// Users never see this — they only enter their handle.
const HANDLE_EMAIL_DOMAIN = 'conference.local';

export { SUPABASE_URL, SUPABASE_ANON_KEY, HANDLE_EMAIL_DOMAIN };
