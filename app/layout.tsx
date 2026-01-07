import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pump.fun Token Explorer',
  description: 'Discover and explore Pump.fun tokens',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}

