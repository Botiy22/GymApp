/* Accounts and syncing (optional).
   Leave both values empty and the app works as before: no sign-in, all data only on the device.
   Fill them in from your Supabase project (Project Settings -> API) and the app asks for an account and keeps the data in your database too.
   Both values are meant to be public: the database only lets a signed-in user see their own row (see supabase.sql).
   NEVER put the "service_role" / "secret" key here. */
window.CLOUD = {
  url: '',   // Project URL, for example https://abcdefghijkl.supabase.co
  key: ''    // "publishable" key (sb_publishable_...) or the older "anon public" key
};
