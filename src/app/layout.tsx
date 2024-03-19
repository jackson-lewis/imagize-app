import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.scss'
import SiteHeader from '@/components/site/site-header'

const quicksand = Quicksand({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Imagize',
  description: 'Imagize - the only complete image optimisation service for the web.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        {children}
      </body>
    </html>
  )
}
