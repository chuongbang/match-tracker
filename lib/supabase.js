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
// Date formatting utility
export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}