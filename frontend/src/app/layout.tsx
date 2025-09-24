import '../styles/globals.css'
import type { Metadata } from 'next'
import { Barlow } from 'next/font/google'
import { ThemeProvider } from '@/context/ThemeContext'
import CustomCursor from '@/components/CustomCursor'

const barlow = Barlow({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
})

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
      <head>
        {/* Custom Font - TT Drugs Trial */}
        <link href="https://fonts.cdnfonts.com/css/tt-drugs-trial" rel="stylesheet" />
        
  {/* Google Tag Manager */}
  <link rel="icon" type="image/x-icon" href="/assets/documint-square-zoomed-white.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N2BWQ5WN');`,
          }}
        />
        {/* End Google Tag Manager */}
        
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QGV0RX7BTS"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QGV0RX7BTS');
            `,
          }}
        />
      </head>
      <body className={`${barlow.className} transition-all duration-700 ease-in-out`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N2BWQ5WN"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ThemeProvider>
          <div className="page-transition">
            {children}
          </div>
          <CustomCursor />
        </ThemeProvider>
      </body>
    </html>
  )
}