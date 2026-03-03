import type { Metadata, Viewport } from 'next'
import { DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'MIMIC AI — Intelligence Profile System',
  description: 'Build structured, multi-dimensional intelligence profiles grounded in research for any historical or contemporary individual.',
}

export const viewport: Viewport = {
  themeColor: '#0A0E1A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("mimic.theme");document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light");})();`,
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
