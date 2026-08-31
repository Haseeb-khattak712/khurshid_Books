import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://qkamlwrxzprnqmllrnwz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYW1sd3J4enBybnFtbGxybnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5Mjg5MDMsImV4cCI6MjEwMzUwNDkwM30.wb9KBwv5ZIq7hxva3S_XjpvGnagv_IM2MyrUg_yyQzk');

async function run() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log(data);
}
run();
