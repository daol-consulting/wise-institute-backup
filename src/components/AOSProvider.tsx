'use client'

import { useEffect } from 'react'
import 'aos/dist/aos.css'

export default function AOSProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initAOS = async () => {
      const AOS = (await import('aos')).default
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100,
      })
    }
    initAOS()
  }, [])

  return <>{children}</>
}
