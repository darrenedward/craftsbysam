import { createClient } from '@supabase/supabase-js';

// These details should be in a .env file, but are hardcoded here for this example.
export const supabaseUrl = 'https://pnltfafygamumaxsiulm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubHRmYWZ5Z2FtdW1heHNpdWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxOTUwNDcsImV4cCI6MjA3Mjc3MTA0N30.dU2T99u6_vTfCSMpdzW3Fe4U92icoan0apC2lWfPxWs';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) as any;