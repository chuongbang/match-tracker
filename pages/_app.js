import '../styles/globals.css'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { onAuthStateChange } from '../lib/supabase'

const publicPages = ['/login', '/signup']

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check auth state
    const { data: authListener } = onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user && !publicPages.includes(router.pathname)) {
      router.push('/login')
    }
  }, [user, loading, router.pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Đang tải...</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dragon Match Tracker</title>
        <meta name="description" content="Quản lý trận đấu" />
        <link rel="icon" type="image/png" href="/bmt_favicon.png" />
        <link rel="shortcut icon" href="/bmt_favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} user={user} />
    </>
  )
}
