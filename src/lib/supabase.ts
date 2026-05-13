/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Custom fetch with 8-second timeout for China network conditions
const fetchWithTimeout = (input: RequestInfo | URL, init?: RequestInit) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  const signal = init?.signal ? init.signal : controller.signal

  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timeout))
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchWithTimeout,
  },
})
