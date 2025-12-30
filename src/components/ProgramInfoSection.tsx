import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, ChevronLeft, ChevronRight, ArrowRight, Award, Users, Edit2 } from 'lucide-react'

type InfoBlock = {
  title: string
  description: string
  href?: string
}

type StoryItem = {
  imageSrc: string
  imageType?: 'image' | 'video'
  caption: string
  href?: string
  onEdit?: () => void
}

type FeaturedProgram = {
  icon: React.ReactNode
  iconBg: string
  title: string
  features: string[]
  buttonText: string
  buttonHref: string
  buttonClass: string
  dotColor: string
}

type Props = {
  mainTitle: string
  infoBlocks: InfoBlock[]
  storyItems: StoryItem[]
  moreLinkText?: string
  moreLinkHref?: string
  featuredPrograms?: FeaturedProgram[]
  featuredProgramsTitle?: string
  featuredProgramsDescription?: string
}

export default function ProgramInfoSection({
  mainTitle,
  infoBlocks,
  storyItems,
  moreLinkText = 'View more stories',
  moreLinkHref = '/stories',
  featuredPrograms,
  featuredProgramsTitle = 'Featured Programs',
  featuredProgramsDescription = 'Choose from our comprehensive range of implant education programs designed for busy clinicians.',
}: Props) {
  const [currentStory, setCurrentStory] = useState(0)
  const [imageHeight, setImageHeight] = useState<number | undefined>(undefined)
  const leftContentRef = useRef<HTMLDivElement>(null)

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % storyItems.length)
  }

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + storyItems.length) % storyItems.length)
  }

  useEffect(() => {
    const updateHeight = () => {
      if (leftContentRef.current && window.innerWidth >= 1024) {
        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
          if (leftContentRef.current) {
            const leftHeight = leftContentRef.current.offsetHeight
            // Use 70% of left content height, with max 500px
            const calculatedHeight = Math.min(leftHeight * 0.7, 500)
            setImageHeight(calculatedHeight)
          }
        })
      } else {
        setImageHeight(undefined)
      }
    }

    // Initial update
    updateHeight()

    // Update on resize
    window.addEventListener('resize', updateHeight)
    
    // Update when images load (in case they affect layout)
    const timer = setTimeout(updateHeight, 100)

    return () => {
      window.removeEventListener('resize', updateHeight)
      clearTimeout(timer)
    }
  }, [mainTitle, infoBlocks, currentStory])

  return (
    <section className="relative section-padding bg-[#f7f7f7]">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 lg:gap-16">
          {/* Left: Main title and info blocks - 6 columns */}
          <div ref={leftContentRef} className="flex flex-col lg:col-span-6" data-aos="fade-right">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-secondary-900 mb-6 sm:mb-8 lg:mb-12 leading-tight">
              {mainTitle}
            </h2>
            
            {/* 2x2 Grid of Info Blocks with inner cross borders only */}
            <div className="grid grid-cols-2 relative">
              {infoBlocks.map((block, idx) => {
                // Determine border classes based on position
                // Top-left (0): right and bottom border (inner cross)
                // Top-right (1): bottom border only (inner cross)
                // Bottom-left (2): right border only (inner cross)
                // Bottom-right (3): no border (inner cross already formed)
                const isTopLeft = idx === 0
                const isTopRight = idx === 1
                const isBottomLeft = idx === 2
                const isBottomRight = idx === 3
                
                let borderClasses = ''
                if (isTopLeft) {
                  borderClasses = 'border-r border-b border-secondary-200'
                } else if (isTopRight) {
                  borderClasses = 'border-b border-secondary-200'
                } else if (isBottomLeft) {
                  borderClasses = 'border-r border-secondary-200'
                } else {
                  borderClasses = '' // Bottom-right: no border (cross is complete)
                }
                
                return (
                <div
                  key={idx}
                  className={`${borderClasses} p-4 sm:p-6 lg:p-8 flex flex-col relative`}
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
                >
                  {block.href ? (
                    <Link href={block.href} className="block group h-full flex flex-col">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-secondary-900 mb-2 sm:mb-3 group-hover:text-primary-600 transition-colors">
                        {block.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary-600 leading-relaxed mb-3 sm:mb-4 flex-1">
                        {block.description}
                      </p>
                      <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-600 flex items-center justify-center group-hover:bg-primary-700 transition-colors mt-auto">
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </button>
                    </Link>
                  ) : (
                    <div className="h-full flex flex-col">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-secondary-900 mb-2 sm:mb-3">
                        {block.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary-600 leading-relaxed mb-3 sm:mb-4 flex-1">
                        {block.description}
                      </p>
                      <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-600 flex items-center justify-center hover:bg-primary-700 transition-colors mt-auto">
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          </div>

          {/* Right: Image carousel - 4 columns, reduced height */}
          <div className="flex flex-col lg:col-span-4" data-aos="fade-left">
            {/* Image container - 70% of left content height, max 500px */}
            <div 
              className="relative overflow-hidden border border-secondary-100 w-full group/image"
              style={{ 
                height: imageHeight ? `${imageHeight}px` : undefined,
                minHeight: imageHeight ? undefined : '250px',
                maxHeight: '500px'
              }}
            >
              {storyItems[currentStory].imageType === 'video' ? (
                <video 
                  src={storyItems[currentStory].imageSrc} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover" 
                />
              ) : (
              <Image
                src={storyItems[currentStory].imageSrc}
                alt={storyItems[currentStory].caption}
                fill
                className="object-cover"
              />
              )}
              {storyItems[currentStory].onEdit && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    storyItems[currentStory].onEdit?.();
                  }}
                  className="absolute top-2 right-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg opacity-0 group-hover/image:opacity-100 z-10"
                  aria-label="Edit image"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Caption and controls below image */}
            <div className="mt-4 lg:mt-6 space-y-4 lg:space-y-6">
              {/* Caption */}
              <p className="text-secondary-900 font-medium text-xs sm:text-sm lg:text-base">
                {storyItems[currentStory].caption}
              </p>

              {/* Carousel Controls */}
              <div className="flex items-center justify-between">
                {/* Progress Bar */}
                <div className="flex-1 h-[2px] bg-secondary-200 mr-3 lg:mr-4">
                  <div
                    className="h-full bg-primary-600 transition-all duration-300"
                    style={{ width: `${((currentStory + 1) / storyItems.length) * 100}%` }}
                  />
                </div>

                {/* Counter and Controls */}
                <div className="flex items-center gap-3 lg:gap-4">
                  <span className="text-xs lg:text-sm text-secondary-600">
                    {currentStory + 1} / {storyItems.length}
                  </span>
                  
                  <button className="text-secondary-600 hover:text-secondary-900 transition-colors">
                    <span className="sr-only">Pause</span>
                    <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1.5 lg:gap-2">
                    <button
                      onClick={prevStory}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-secondary-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-secondary-700" />
                    </button>
                    <button
                      onClick={nextStory}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-secondary-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
                      aria-label="Next"
                    >
                      <ChevronRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-secondary-700" />
                    </button>
                  </div>
                </div>
              </div>

              {/* More Link */}
              <Link
                href={moreLinkHref}
                className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors text-sm lg:text-base"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <span>{moreLinkText}</span>
                <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <ArrowRight className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-primary-600" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Programs Section */}
        {featuredPrograms && featuredPrograms.length > 0 && (
          <div className="mt-16 lg:mt-20">
            <div className="text-center mb-12" data-aos="fade-up">
              <h2 className="text-4xl sm:text-5xl font-bold text-secondary-900 mb-4 lg:mb-6">
                {featuredProgramsTitle}
              </h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
                {featuredProgramsDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {featuredPrograms.map((program, idx) => (
                <div key={idx} className="group" data-aos="fade-up" data-aos-delay={idx * 150}>
                  <div className="card-modern p-10 hover-lift h-full">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className={`${program.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center`}>
                        {program.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-secondary-900">
                        {program.title}
                      </h3>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      {program.features.map((feature, featureIdx) => (
                        <div key={featureIdx} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 ${program.dotColor} rounded-full mt-2`}></div>
                          <span className="text-secondary-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Link href={program.buttonHref} className={`${program.buttonClass} group-hover:scale-105 transition-transform duration-300`}>
                      {program.buttonText}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

