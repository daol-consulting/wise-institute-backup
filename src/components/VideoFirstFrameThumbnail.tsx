'use client'

import { useState, useEffect, useRef } from 'react'

type VideoFirstFrameThumbnailProps = {
  src: string
  fallbackPoster?: string
  className?: string
  onMouseEnter?: (e: React.MouseEvent<HTMLVideoElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLVideoElement>) => void
}

export default function VideoFirstFrameThumbnail({
  src,
  fallbackPoster,
  className,
  onMouseEnter,
  onMouseLeave,
}: VideoFirstFrameThumbnailProps) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [isInView, setIsInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Pre-load: start observing immediately with large rootMargin so above-fold items load right away
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true)
      },
      { rootMargin: '100% 0px 100% 0px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Capture first frame (pre-load on mount for visible items)
  useEffect(() => {
    if (!isInView || !src) return

    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    const handleLoadedData = () => {
      video.currentTime = 0
    }

    const handleSeeked = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          setPosterUrl(dataUrl)
        }
      } catch {
        // CORS or canvas tainted - keep fallbackPoster if any
      }
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('seeked', handleSeeked)
    video.src = src

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('seeked', handleSeeked)
      video.src = ''
    }
  }, [isInView, src])

  const effectivePoster = posterUrl || fallbackPoster || undefined

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <video
        src={src}
        poster={effectivePoster}
        className={className}
        preload="metadata"
        muted
        playsInline
        loop
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </div>
  )
}
