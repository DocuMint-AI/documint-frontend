import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/context/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || 'DocuMint AI'} - Legal Document Analysis`,
  description: 'AI-powered legal document analysis and insights platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} transition-all duration-700 ease-in-out`}>
        <ThemeProvider>
          <div className="page-transition">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}