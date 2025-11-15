import '@/styles/globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AOSProvider from '@/components/AOSProvider'
import { Inter } from 'next/font/google'

const headingFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-heading',
})

export const metadata = {
  title: 'WISE Institute - Western Implant and Surgical Excellence',
  description: 'Advancing Dental Education Through Hands-On Experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={headingFont.variable}>
      <head>
        <link rel="preload" href="/fonts/Pretendard.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="font-pretendard">
        <AOSProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AOSProvider>
      </body>
    </html>
  )
}
