/*
  Supabase public client config.
  The anon key is designed to be used in browser apps.
  Security is enforced by the Row Level Security policies in supabase-schema.sql.
*/
window.PORTFOLIO_CONFIG = {
  supabaseUrl: "PASTE_YOUR_SUPABASE_PROJECT_URL",
  supabaseAnonKey: "PASTE_YOUR_SUPABASE_ANON_KEY"
};
