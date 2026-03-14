import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, DM_Mono, Space_Mono, Spectral, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

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
  themeColor: '#EEECEA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${spaceMono.variable} ${spectral.variable} ${dmMono.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("mimic.theme");document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light");})();`,
          }}
        />

        {/* Dot-grid texture layer (light theme) */}
        <div className="page-dot-grid" aria-hidden="true" />
        <div className="noise-overlay" />

        {children}
        <Analytics />
      </body>
    </html>
  )
}
