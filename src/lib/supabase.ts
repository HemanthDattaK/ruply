// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bfgbeujkyebwjpefcufl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmZ2JldWpreWVid2pwZWZjdWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDQ3NTMsImV4cCI6MjA2NDAyMDc1M30.L_2rmKkDeeIbOwVy9HwtCV8CUs-Je87L3noJBvmMZRU'
)

export { supabase }