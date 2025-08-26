import * as React from 'react'
import Head from 'next/head'
import { ThemeProvider } from '../src/context/ThemeContext'
import CssBaseline from '@mui/material/CssBaseline'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>DocuMint</title>
      </Head>
      <ThemeProvider>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}
