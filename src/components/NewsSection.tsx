import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight, Clock } from 'lucide-react'
import SectionHeader from './SectionHeader'

type NewsItem = {
  category: string
  categoryColor: string
  title: string
  description: string
  date: string
  href?: string
}

type Props = {
  eyebrow?: string
  title: string
  description?: string
  newsItems: NewsItem[]
  viewAllText?: string
  viewAllHref?: string
}

export default function NewsSection({
  eyebrow = 'NEWS',
  title,
  description,
  newsItems,
  viewAllText = 'View all news',
  viewAllHref = '/news',
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Mobile: show 2 items per page, Desktop: show 4 items at a time, slide one at a time
  const itemsPerPageMobile = 2
  const itemsVisibleDesktop = 4
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Desktop: slide one item at a time (show 4 items)
  // Mobile: show 2 items per page
  const getVisibleItems = () => {
    if (isMobile) {
      // Mobile pagination
      const itemsPerPage = itemsPerPageMobile
      const page = Math.floor(currentIndex / itemsPerPage)
      const startIndex = page * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return newsItems.slice(startIndex, endIndex)
    } else {
      // Desktop: show 4 items, slide one at a time
      const maxIndex = Math.max(0, newsItems.length - itemsVisibleDesktop)
      const clampedIndex = Math.min(currentIndex, maxIndex)
      return newsItems.slice(clampedIndex, clampedIndex + itemsVisibleDesktop)
    }
  }

  const currentItems = getVisibleItems()
  const maxMobilePages = Math.ceil(newsItems.length / itemsPerPageMobile)
  const maxDesktopIndex = Math.max(0, newsItems.length - itemsVisibleDesktop)

  const nextItem = () => {
    if (isMobile) {
      // Mobile: go to next page (2 items)
      const itemsPerPage = itemsPerPageMobile
      const currentPage = Math.floor(currentIndex / itemsPerPage)
      const nextPage = (currentPage + 1) % maxMobilePages
      setCurrentIndex(nextPage * itemsPerPage)
    } else {
      // Desktop: slide one item to the right
      setCurrentIndex((prev) => Math.min(prev + 1, maxDesktopIndex))
    }
  }

  const prevItem = () => {
    if (isMobile) {
      // Mobile: go to previous page (2 items)
      const itemsPerPage = itemsPerPageMobile
      const currentPage = Math.floor(currentIndex / itemsPerPage)
      const prevPage = (currentPage - 1 + maxMobilePages) % maxMobilePages
      setCurrentIndex(prevPage * itemsPerPage)
    } else {
      // Desktop: slide one item to the left
      setCurrentIndex((prev) => Math.max(prev - 1, 0))
    }
  }

  const canGoNext = isMobile 
    ? Math.floor(currentIndex / itemsPerPageMobile) < maxMobilePages - 1
    : currentIndex < maxDesktopIndex
  const canGoPrev = isMobile
    ? Math.floor(currentIndex / itemsPerPageMobile) > 0
    : currentIndex > 0

  return (
    <section className="relative section-padding bg-white">
      <div className="container-custom">
        {/* Header with navigation buttons */}
        <div className="mb-6 sm:mb-8 lg:mb-12" data-aos="fade-up">
          {/* Eyebrow */}
          <p className="uppercase tracking-wider text-primary-600 font-bold text-sm sm:text-base lg:text-lg mb-3">
            {eyebrow}
          </p>
          
          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-secondary-800 leading-tight mb-4">
            {title}
          </h2>
          
          {/* Description and Navigation buttons row */}
          <div className="flex items-center justify-between gap-4">
            {/* Description */}
            {description && (
              <p className="text-base sm:text-lg lg:text-xl text-secondary-600 flex-1">
                {description}
              </p>
            )}
            
            {/* Navigation buttons - Right side, aligned with description */}
            {(canGoNext || canGoPrev) && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={prevItem}
                  disabled={!canGoPrev}
                  className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-secondary-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors ${
                    !canGoPrev ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-700" />
                </button>
                <button
                  onClick={nextItem}
                  disabled={!canGoNext}
                  className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-secondary-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors ${
                    !canGoNext ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-700" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* News Grid - Mobile: 1 column (show 2 items), Desktop: 4 columns (show 4 items, slide one at a time) */}
        <div className="relative mb-6 sm:mb-8 lg:mb-12">
          {/* Desktop: Horizontal scroll container with fixed height cards */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
            {currentItems.map((item, idx) => (
              <Link
                key={item.href || idx}
                href={item.href || '#'}
                className="block group"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="bg-white border border-secondary-100 rounded-lg p-5 sm:p-6 hover:shadow-lg transition-shadow duration-300 h-[320px] flex flex-col">
                  {/* Category */}
                  <div className="mb-3">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                        item.categoryColor === 'blue'
                          ? 'text-blue-600 bg-blue-50'
                          : item.categoryColor === 'teal'
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-secondary-600 bg-secondary-50'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[3rem]">
                    {item.title}
                  </h3>

                  {/* Description - Fixed height with ellipsis */}
                  <p className="text-sm text-secondary-600 leading-relaxed mb-4 flex-1 line-clamp-4 overflow-hidden">
                    {item.description}
                  </p>

                  {/* Date - Small clock icon and date */}
                  <div className="flex items-center gap-2 text-xs text-secondary-500 mt-auto">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile: 1 column grid */}
          <div className="grid lg:hidden grid-cols-1 gap-4 sm:gap-5">
            {currentItems.map((item, idx) => (
              <Link
                key={item.href || idx}
                href={item.href || '#'}
                className="block group"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="bg-white border border-secondary-100 rounded-lg p-5 sm:p-6 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  {/* Category */}
                  <div className="mb-2 sm:mb-3">
                    <span
                      className={`inline-block text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${
                        item.categoryColor === 'blue'
                          ? 'text-blue-600 bg-blue-50'
                          : item.categoryColor === 'teal'
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-secondary-600 bg-secondary-50'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-secondary-900 mb-2 sm:mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-secondary-600 leading-relaxed mb-4 sm:mb-5 flex-1 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-secondary-500">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Button - centered */}
        <div className="flex justify-center" data-aos="fade-up" data-aos-delay="150">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 border border-secondary-200 bg-white hover:bg-gray-50 rounded-lg font-semibold text-sm sm:text-base text-secondary-900 hover:text-primary-600 transition-colors"
          >
            <span>{viewAllText}</span>
            <ArrowRight className="w-4 h-4 text-primary-600" />
          </Link>
        </div>
      </div>
    </section>
  )
}

