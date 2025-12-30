import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight, Clock, Edit2 } from 'lucide-react'

type NewsItem = {
  id?: string
  category: string
  categoryColor: string
  title: string
  description: string
  date: string
  href?: string
  onEdit?: () => void
}

type Props = {
  eyebrow?: string
  title: string
  description?: string
  newsItems: NewsItem[]
  viewAllText?: string
  viewAllHref?: string
}

// Constants - Named magic numbers for clarity
const MOBILE_BREAKPOINT_PX = 768
const ITEMS_PER_PAGE_MOBILE = 2
const ITEMS_VISIBLE_DESKTOP = 4
const DESKTOP_CARD_HEIGHT_PX = 320
const RESIZE_DEBOUNCE_MS = 150

// NewsCard component - Extracted to eliminate duplication
type NewsCardProps = {
  item: NewsItem
  index: number
  isMobile: boolean
  getCategoryColorClasses: (categoryColor: string) => string
}

function NewsCard({ item, index, isMobile, getCategoryColorClasses }: NewsCardProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    item.onEdit?.()
  }

  const cardClasses = isMobile
    ? 'bg-white border border-secondary-100 rounded-lg p-5 sm:p-6 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col'
    : 'bg-white border border-secondary-100 rounded-lg p-5 sm:p-6 hover:shadow-lg transition-shadow duration-300 h-[320px] flex flex-col'

  const categoryContainerClasses = isMobile ? 'mb-2 sm:mb-3' : 'mb-3'
  const categorySpanClasses = isMobile
    ? 'inline-block text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full'
    : 'inline-block text-xs font-semibold px-2.5 py-1 rounded-full'

  const titleClasses = isMobile
    ? 'text-base sm:text-lg font-bold text-secondary-900 mb-2 sm:mb-3 group-hover:text-primary-600 transition-colors line-clamp-2'
    : 'text-base font-bold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[3rem]'

  const descriptionClasses = isMobile
    ? 'text-sm sm:text-base text-secondary-600 leading-relaxed mb-4 sm:mb-5 flex-1 line-clamp-3'
    : 'text-sm text-secondary-600 leading-relaxed mb-4 flex-1 line-clamp-4 overflow-hidden'

  const dateClasses = isMobile
    ? 'flex items-center gap-2 text-xs sm:text-sm text-secondary-500'
    : 'flex items-center gap-2 text-xs text-secondary-500 mt-auto'

  const clockIconClasses = isMobile
    ? 'w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0'
    : 'w-3.5 h-3.5 flex-shrink-0'

  return (
    <div
      className="relative group"
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      {item.onEdit && (
        <button
          onClick={handleEditClick}
          className="absolute top-2 right-2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg opacity-0 group-hover:opacity-100 z-10"
          aria-label="Edit news"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      )}
      <Link href={item.href || '#'} className="block">
        <div className={cardClasses}>
          {/* Category */}
          <div className={categoryContainerClasses}>
            <span className={`${categorySpanClasses} ${getCategoryColorClasses(item.categoryColor)}`}>
              {item.category}
            </span>
          </div>

          {/* Title */}
          <h3 className={titleClasses}>
            {item.title}
          </h3>

          {/* Description */}
          <p className={descriptionClasses}>
            {item.description}
          </p>

          {/* Date */}
          <div className={dateClasses}>
            <Clock className={clockIconClasses} />
            <span>{item.date}</span>
          </div>
        </div>
      </Link>
    </div>
  )
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
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    // Initialize with safe default to avoid hydration mismatch
    setIsMobile(typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT_PX)
    
    let timeoutId: NodeJS.Timeout
    const checkMobile = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX)
      }, RESIZE_DEBOUNCE_MS)
    }
    
    window.addEventListener('resize', checkMobile)
    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(timeoutId)
    }
  }, [])

  // Computed values - memoized for performance
  const maxMobilePages = useMemo(
    () => Math.ceil(newsItems.length / ITEMS_PER_PAGE_MOBILE),
    [newsItems.length]
  )
  
  const maxDesktopIndex = useMemo(
    () => Math.max(0, newsItems.length - ITEMS_VISIBLE_DESKTOP),
    [newsItems.length]
  )

  // Desktop: slide one item at a time (show 4 items)
  // Mobile: show 2 items per page
  const currentItems = useMemo(() => {
    if (isMobile) {
      // Mobile pagination
      const currentPage = Math.floor(currentIndex / ITEMS_PER_PAGE_MOBILE)
      const startIndex = currentPage * ITEMS_PER_PAGE_MOBILE
      const endIndex = startIndex + ITEMS_PER_PAGE_MOBILE
      return newsItems.slice(startIndex, endIndex)
    } else {
      // Desktop: show 4 items, slide one at a time
      const clampedIndex = Math.min(currentIndex, maxDesktopIndex)
      return newsItems.slice(clampedIndex, clampedIndex + ITEMS_VISIBLE_DESKTOP)
    }
  }, [isMobile, currentIndex, newsItems, maxDesktopIndex])

  const nextItem = useCallback(() => {
    if (isMobile) {
      // Mobile: go to next page (2 items)
      const currentPage = Math.floor(currentIndex / ITEMS_PER_PAGE_MOBILE)
      const nextPage = (currentPage + 1) % maxMobilePages
      setCurrentIndex(nextPage * ITEMS_PER_PAGE_MOBILE)
    } else {
      // Desktop: slide one item to the right
      setCurrentIndex((prev) => Math.min(prev + 1, maxDesktopIndex))
    }
  }, [isMobile, currentIndex, maxMobilePages, maxDesktopIndex])

  const prevItem = useCallback(() => {
    if (isMobile) {
      // Mobile: go to previous page (2 items)
      const currentPage = Math.floor(currentIndex / ITEMS_PER_PAGE_MOBILE)
      const prevPage = (currentPage - 1 + maxMobilePages) % maxMobilePages
      setCurrentIndex(prevPage * ITEMS_PER_PAGE_MOBILE)
    } else {
      // Desktop: slide one item to the left
      setCurrentIndex((prev) => Math.max(prev - 1, 0))
    }
  }, [isMobile, currentIndex, maxMobilePages])

  const canGoNext = useMemo(() => {
    return isMobile 
      ? Math.floor(currentIndex / ITEMS_PER_PAGE_MOBILE) < maxMobilePages - 1
      : currentIndex < maxDesktopIndex
  }, [isMobile, currentIndex, maxMobilePages, maxDesktopIndex])
  
  const canGoPrev = useMemo(() => {
    return isMobile
      ? Math.floor(currentIndex / ITEMS_PER_PAGE_MOBILE) > 0
      : currentIndex > 0
  }, [isMobile, currentIndex])

  // Helper function to get category color classes
  const getCategoryColorClasses = (categoryColor: string) => {
    if (categoryColor === 'blue') {
      return 'text-blue-600 bg-blue-50'
    }
    if (categoryColor === 'teal') {
      return 'text-primary-600 bg-primary-50'
    }
    return 'text-secondary-600 bg-secondary-50'
  }

  // Generate stable key for items - always use id first, then index as fallback
  const getItemKey = (item: NewsItem, index: number) => {
    // Always use id if available, otherwise use index to ensure uniqueness
    return item.id || `news-item-${index}`
  }

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
              <NewsCard
                key={getItemKey(item, idx)}
                item={item}
                index={idx}
                isMobile={false}
                getCategoryColorClasses={getCategoryColorClasses}
              />
            ))}
          </div>

          {/* Mobile: 1 column grid */}
          <div className="grid lg:hidden grid-cols-1 gap-4 sm:gap-5">
            {currentItems.map((item, idx) => (
              <NewsCard
                key={getItemKey(item, idx)}
                item={item}
                index={idx}
                isMobile={true}
                getCategoryColorClasses={getCategoryColorClasses}
              />
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

