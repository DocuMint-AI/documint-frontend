import * as React from 'react'
import Head from 'next/head'
import { ThemeProvider } from '../src/context/ThemeContext'
import { DocumentProvider } from '../src/context/DocumentContext'
import { Material3ThemeProvider } from '../src/theme/Material3ThemeProvider'
import CssBaseline from '@mui/material/CssBaseline'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>DocuMint AI - Legal Document Analysis</title>
      </Head>
      <Material3ThemeProvider>
        <ThemeProvider>
          <DocumentProvider>
            <CssBaseline />
            <Component {...pageProps} />
          </DocumentProvider>
        </ThemeProvider>
      </Material3ThemeProvider>
    </>
  )
}
