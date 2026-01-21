import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Dragon Match Tracker</title>
        <meta name="description" content="Quản lý trận đấu" />
        <link rel="icon" type="image/png" href="/bmt_favicon.png" />
        <link rel="shortcut icon" href="/bmt_favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
