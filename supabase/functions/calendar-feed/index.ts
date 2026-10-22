import { createHandler } from './handler.mjs';
const list = (name: string) => (Deno.env.get(name) || '').split(',').map(v => v.trim()).filter(Boolean);
Deno.serve(createHandler({
  projectUrl: Deno.env.get('SUPABASE_URL'),
  anonKey: Deno.env.get('SUPABASE_ANON_KEY'),
  origins: list('CALENDAR_ALLOWED_ORIGINS'),
  extraHosts: list('CALENDAR_FEED_HOSTS'),
}));
