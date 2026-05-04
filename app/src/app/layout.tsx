import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Toward Perfection',
  description: 'A system of conscious body control. Strength. Mobility. Awareness.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
