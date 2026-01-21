import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const isSupabaseConfigured = () => !!supabase

// Auth helpers
export const signUp = (email, password) => {
  return supabase.auth.signUp({ email, password })
}

export const signIn = (email, password) => {
  return supabase.auth.signInWithPassword({ email, password })
}

export const signOut = () => {
  return supabase.auth.signOut()
}

export const getSession = () => {
  return supabase.auth.getSession()
}

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}
