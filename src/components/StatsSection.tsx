import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import SectionHeader from '@/components/SectionHeader'
import DiagonalRibbon from '@/components/DiagonalRibbon'

type StatItem = {
  value: string
  label: string
  icon?: React.ReactNode
}

type Props = {
  imageSrc: string
  eyebrow: string
  title: string
  description: string
  leftStat: StatItem
  rightStat: StatItem
}

export default function StatsSection({
  imageSrc,
  eyebrow,
  title,
  description,
  leftStat,
  rightStat,
}: Props) {
  const [leftCount, setLeftCount] = useState(0)
  const [rightCount, setRightCount] = useState(0)
  const hasAnimatedRef = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Parse number from stat value (e.g., "200+ hours" -> 200, "80+ doctors" -> 80)
  const parseNumber = (value: string): number => {
    const match = value.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  // Get suffix from stat value (e.g., "200+ hours" -> "+ hours")
  const getSuffix = (value: string): string => {
    const match = value.match(/\d+(.*)/)
    return match ? match[1] : ''
  }

  const leftTarget = parseNumber(leftStat.value)
  const rightTarget = parseNumber(rightStat.value)
  const leftSuffix = getSuffix(leftStat.value)
  const rightSuffix = getSuffix(rightStat.value)

  // Animate counting up
  useEffect(() => {
    const currentRef = sectionRef.current
    if (!currentRef || hasAnimatedRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true
            observer.unobserve(entry.target)

            // Animate left count
            const animateLeft = () => {
              const duration = 2000 // 2 seconds
              const startTime = Date.now()
              const startValue = 0
              
              const updateLeft = () => {
                const now = Date.now()
                const progress = Math.min((now - startTime) / duration, 1)
                const currentValue = Math.floor(startValue + (leftTarget - startValue) * progress)
                setLeftCount(currentValue)
                
                if (progress < 1) {
                  requestAnimationFrame(updateLeft)
                } else {
                  setLeftCount(leftTarget)
                }
              }
              
              requestAnimationFrame(updateLeft)
            }

            // Animate right count
            const animateRight = () => {
              const duration = 2000 // 2 seconds
              const startTime = Date.now()
              const startValue = 0
              
              const updateRight = () => {
                const now = Date.now()
                const progress = Math.min((now - startTime) / duration, 1)
                const currentValue = Math.floor(startValue + (rightTarget - startValue) * progress)
                setRightCount(currentValue)
                
                if (progress < 1) {
                  requestAnimationFrame(updateRight)
                } else {
                  setRightCount(rightTarget)
                }
              }
              
              requestAnimationFrame(updateRight)
            }

            // Start animations
            animateLeft()
            animateRight()
          }
        })
      },
      {
        threshold: 0.1, // Trigger when 10% of the section is visible
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before fully visible
      }
    )

    observer.observe(currentRef)

    return () => {
      observer.disconnect()
    }
  }, [leftTarget, rightTarget])

  return (
    <section ref={sectionRef} className="relative bg-white pb-16 sm:pb-20 lg:pb-0">
      {/* Mobile Layout: Image with overlay header -> Stats (stacked) */}
      {/* Desktop Layout: Image and Header side by side, then Stats below */}
      
      {/* Image with combined header and stats box on mobile - Full width */}
      <div className="lg:hidden w-full relative pb-32 sm:pb-40 mb-8 sm:mb-12" data-aos="fade-up">
        <div className="relative border-b border-secondary-100">
          <div className="relative aspect-[4/3] sm:aspect-[3/2] overflow-hidden">
            <Image src={imageSrc} alt={title} fill className="object-cover" sizes="100vw" />
          </div>
          {/* Combined overlay box - header + stats, positioned at bottom, left margin, right no margin */}
          <div className="absolute top-[60%] left-4 sm:left-5 right-0 z-50" data-aos="fade-up" data-aos-delay="100">
            <div className="relative">
              {/* Ribbon behind card on mobile - positioned first, lower z-index */}
              <DiagonalRibbon 
                wrapperClassName="absolute left-8 right-0 -bottom-2 z-0 pointer-events-none" 
                heightClass="h-6 sm:h-8"
              />
              {/* Card box - positioned above ribbon, covers ribbon with white background */}
              <div className="relative z-10 bg-white p-6 sm:p-8 pb-8 sm:pb-10 shadow-lg border border-secondary-100 border-r-0">
                {/* Header Section */}
                <div className="text-left mb-6 sm:mb-8">
                  <SectionHeader
                    eyebrow={eyebrow}
                    title={title}
                    description={description}
                    className="mb-0"
                    titleClassName="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-secondary-800 leading-tight text-left"
                    descriptionClassName="mt-3 text-sm sm:text-base lg:text-lg text-secondary-600 text-left"
                    eyebrowClassName="uppercase tracking-wider text-primary-600 font-bold text-sm sm:text-base lg:text-lg mb-3 text-left"
                  />
                </div>
                
                {/* Stats Section - Vertical stack with border between cards */}
                <div className="space-y-0 border-secondary-200 pt-6 sm:pt-8">
                  {/* First Stat Card */}
                  <div className="flex items-center justify-between gap-4 py-4 sm:py-6 border-b border-secondary-200">
                    <div className="flex-1">
                      <div className="text-2xl sm:text-3xl font-extrabold text-secondary-900">
                        {leftCount}{leftSuffix}
                      </div>
                      <div className="mt-1 sm:mt-2 text-secondary-600 text-xs sm:text-sm">{leftStat.label}</div>
                    </div>
                    {leftStat.icon && (
                      <div className="text-primary-600 flex-shrink-0">
                        {leftStat.icon}
                      </div>
                    )}
                  </div>
                  
                  {/* Second Stat Card */}
                  <div className="flex items-center justify-between gap-4 py-4 sm:py-6">
                    <div className="flex-1">
                      <div className="text-2xl sm:text-3xl font-extrabold text-secondary-900">
                        {rightCount}{rightSuffix}
                      </div>
                      <div className="mt-1 sm:mt-2 text-secondary-600 text-xs sm:text-sm">{rightStat.label}</div>
                    </div>
                    {rightStat.icon && (
                      <div className="text-primary-600 flex-shrink-0">
                        {rightStat.icon}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="section-padding lg:section-padding">
        <div className="container-custom">

        {/* Desktop Top Grid - Image and Header side by side */}
        <div className="hidden lg:grid grid-cols-2 gap-12 items-start mb-10">
          {/* Left big image */}
          <div className="overflow-hidden shadow-xl border border-secondary-100" data-aos="fade-right">
            <div className="relative aspect-[4/3]">
              <Image src={imageSrc} alt={title} fill className="object-cover" />
            </div>
          </div>

          {/* Right header */}
          <div data-aos="fade-left">
            <SectionHeader
              eyebrow={eyebrow}
              title={title}
              description={description}
              dataAos="fade-left"
            />
          </div>
        </div>

        {/* Stats Card - Desktop only, side by side */}
        <div className="relative mt-8 lg:mt-0 hidden lg:block" data-aos="fade-up">
          <div className="relative z-10 bg-white border border-secondary-100 p-6 sm:p-8 lg:p-10 lg:p-12">
            {/* Desktop: Horizontal layout */}
            <div className="grid grid-cols-2 divide-x divide-secondary-100">
              {/* Left */}
              <div className="flex items-center justify-between gap-6 pr-10">
                <div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-secondary-900">
                    {leftCount}{leftSuffix}
                  </div>
                  <div className="mt-2 text-secondary-600 text-sm">{leftStat.label}</div>
                </div>
                {leftStat.icon && (
                  <div className="text-primary-600 flex-shrink-0">
                    {leftStat.icon}
                  </div>
                )}
              </div>
              {/* Right */}
              <div className="flex items-center justify-between gap-6 pl-10">
                <div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-secondary-900">
                    {rightCount}{rightSuffix}
                  </div>
                  <div className="mt-2 text-secondary-600 text-sm">{rightStat.label}</div>
                </div>
                {rightStat.icon && (
                  <div className="text-primary-600 flex-shrink-0">
                    {rightStat.icon}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DiagonalRibbon wrapperClassName="absolute left-6 right-6 -bottom-0 z-0" heightClass="h-8" />
        </div>
        </div>
      </div>
    </section>
  )
}
