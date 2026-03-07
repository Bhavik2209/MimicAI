import type { Metadata, Viewport } from 'next'
import { Space_Mono, Spectral, DM_Mono, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

const spectral = Spectral({
  subsets: ['latin'],
  variable: '--font-spectral',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
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
    <html lang="en" className={`${spaceMono.variable} ${spectral.variable} ${dmMono.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="antialiased">
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
