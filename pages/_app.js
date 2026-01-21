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
<div className="min-h-screen w-full relative">
  {/* Aurora Dream Vivid Bloom */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: `
        radial-gradient(ellipse 80% 60% at 70% 20%, rgba(175, 109, 255, 0.85), transparent 68%),
        radial-gradient(ellipse 70% 60% at 20% 80%, rgba(255, 100, 180, 0.75), transparent 68%),
        radial-gradient(ellipse 60% 50% at 60% 65%, rgba(255, 235, 170, 0.98), transparent 68%),
        radial-gradient(ellipse 65% 40% at 50% 60%, rgba(120, 190, 255, 0.3), transparent 68%),
        linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%)
      `,
    }}
  />
  {/* Your content goes here */}
          <div className="relative z-10">
          <Component {...pageProps} user={user} />
        </div>
</div>
    </>
  )
}
