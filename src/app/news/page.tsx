'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Home, ChevronUp, Plus, Edit2 } from 'lucide-react'
import PageHero from '../../components/PageHero'
import { NewsItem } from '@/lib/news'
import { checkAdminSession } from '@/lib/admin'
import NewsEditModal from '@/components/NewsEditModal'

// Fallback data
const defaultNewsItems: NewsItem[] = [
  {
    id: '10',
    category: 'Institute News',
    categoryColor: 'blue',
    title: 'New 2025 Implant Residency Program Dates Announced',
    description: 'WISE Institute is pleased to announce the new dates for the 2025 Implant Residency Program. This comprehensive program offers hands-on training and advanced techniques in implant dentistry.',
    date: '2025-01-15',
    href: '/news/10',
    createdAt: new Date().toISOString(),
  },
  {
    id: '9',
    category: 'Press Release',
    categoryColor: 'teal',
    title: 'WISE Institute Partners with HiOssen for Enhanced Training',
    description: 'WISE Institute announces a strategic partnership with HiOssen to provide enhanced training opportunities and access to cutting-edge implant technology for our residents.',
    date: '2025-12-10',
    href: '/news/9',
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    category: 'Institute News',
    categoryColor: 'blue',
    title: 'Record Number of Doctors Complete 2025 Residency Program',
    description: 'This year marks a milestone as a record number of doctors successfully completed the WISE Institute Residency Program, demonstrating our commitment to excellence in dental education.',
    date: '2025-11-20',
    href: '/news/8',
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    category: 'Press Release',
    categoryColor: 'teal',
    title: 'WISE Institute Live Surgery Featured at PDC 2025',
    description: 'WISE Institute was honored to feature live surgery demonstrations at the prestigious PDC 2025 conference, showcasing advanced implant techniques to an international audience.',
    date: '2025-10-05',
    href: '/news/7',
    createdAt: new Date().toISOString(),
  },
]

export default function NewsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [newsItems, setNewsItems] = useState<NewsItem[]>(defaultNewsItems)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showNewsModal, setShowNewsModal] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [mediaItems, setMediaItems] = useState<Array<{ id: string; title: string; thumbnail?: string[] }>>([])

  // Load news items from CMS
  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          console.log('News API response:', data);
          console.log('News items count:', data.length);
          if (data.length > 0) {
            setNewsItems(data);
          } else {
            console.log('No news items from API, using default items');
          }
        } else {
          console.error('News API error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error loading news:', error);
      }
    };
    loadNews();
  }, []);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminSession();
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        // Load media items for selection
        try {
          const mediaResponse = await fetch('/api/media');
          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            setMediaItems(mediaData);
          }
        } catch (error) {
          console.error('Error loading media items:', error);
        }
      }
    };
    checkAdmin();
  }, []);

  const handleRefreshNews = async () => {
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setNewsItems(data);
        }
      }
    } catch (error) {
      console.error('Error loading news:', error);
    }
  };

  // Views 기능 제거됨 (Contentful 업데이트로 인한 성능 이슈)
  // const getViewCount = (item: NewsItem) => {
  //   return item.views ?? 0
  // }

  // Get unique categories from news items
  const categories = Array.from(new Set(newsItems.map(item => item.category).filter(Boolean)))
  
  // Filter news items based on search query and selected category
  const filteredNews = newsItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="WISE Institute"
        title="WISE Institute News"
        backgroundImage="/gallery/wise3.webp"
        overlayClassName="bg-black/50"
        heightClassName="mt-16 lg:mt-20 h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] xl:h-[500px]"
        breadcrumbs={[
          { label: 'Home', href: '/', icon: <Home className="h-4 w-4" />, showLabel: false },
          { label: 'News' },
        ]}
      />

      {/* Main Content */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {/* Search Bar - Mobile: below title, Desktop: top right */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              {/* Title and Count - Desktop only */}
              <div className="hidden lg:block">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900 mb-2">
                  WISE Institute News
                </h2>
                <p className="text-sm sm:text-base text-secondary-600">
                  Total {filteredNews.length} items
                  {selectedCategory && (
                    <span className="text-primary-600"> in {selectedCategory}</span>
                  )}
                </p>
              </div>

              {/* Search Bar and Admin Actions */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64 xl:w-80">
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 sm:py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <button
                  type="button"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors flex-shrink-0"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNews(null);
                      setShowNewsModal(true);
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors flex-shrink-0"
                    aria-label="Create News"
                    title="Create News"
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Badges */}
          {categories.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  All
                </button>
                {categories.map((category) => {
                  const categoryItem = newsItems.find(item => item.category === category)
                  const categoryColor = categoryItem?.categoryColor || 'gray'
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
                        selectedCategory === category
                          ? categoryColor === 'blue'
                            ? 'bg-blue-600 text-white'
                            : categoryColor === 'teal'
                            ? 'bg-primary-600 text-white'
                            : 'bg-secondary-600 text-white'
                          : categoryColor === 'blue'
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          : categoryColor === 'teal'
                          ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                          : 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'
                      }`}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Total Count - Mobile: shown above list */}
          <div className="lg:hidden mb-4">
            <p className="text-sm text-secondary-900">
              Total <span className="text-primary-600 font-semibold">{filteredNews.length}</span> items
              {selectedCategory && (
                <span className="text-secondary-600"> in {selectedCategory}</span>
              )}
            </p>
          </div>

          {/* News List Table */}
          <div className="border-t border-b border-secondary-200">
            {/* Table Header - Desktop */}
            <div className="hidden lg:grid grid-cols-12 gap-4 py-4 bg-secondary-50 border-b border-secondary-200">
              <div className="col-span-1 text-center text-sm font-bold text-secondary-900">
                No.
              </div>
              <div className="col-span-7 text-sm font-bold text-secondary-900">
                Title
              </div>
              <div className="col-span-3 flex items-center justify-end text-sm font-bold text-secondary-900">
                Date
              </div>
              {/* Views 컬럼 제거됨 */}
            </div>

            {/* News Items */}
            <div className="divide-y divide-secondary-200">
              {filteredNews.length === 0 ? (
                <div className="py-12 text-center text-secondary-600">
                  No news items found.
                </div>
              ) : (
                filteredNews.map((item, index) => {
                  const newsHref = item.href && item.href !== '/news' ? item.href : `/news/${item.id}`;
                  return (
                  <div
                    key={item.id}
                    onClick={() => {
                      console.log('Navigating to:', newsHref);
                      router.push(newsHref);
                    }}
                    className="block hover:bg-secondary-50 transition-colors cursor-pointer"
                  >
                    {/* Desktop Layout */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 py-4">
                      {/* Number */}
                      <div className="col-span-1 flex items-center justify-center text-sm text-secondary-600">
                        {index + 1}
                      </div>

                      {/* Title with Category */}
                      <div className="col-span-7">
                        <div className="flex items-center gap-3">
                          {/* Category */}
                          <span
                            className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                              item.categoryColor === 'blue'
                                ? 'text-blue-600 bg-blue-50'
                                : item.categoryColor === 'teal'
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-secondary-600 bg-secondary-50'
                            }`}
                          >
                            {item.category}
                          </span>
                          {/* Title */}
                          <h3 className="text-sm text-secondary-900 font-medium hover:text-primary-600 transition-colors line-clamp-2 flex-1">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="col-span-3 flex items-center justify-end text-sm text-secondary-600">
                        {item.date}
                      </div>

                      {/* Views 제거됨 */}
                    </div>

                    {/* Mobile Layout */}
                    <div className="lg:hidden py-3 sm:py-4 px-4">
                      <div className="flex items-start gap-3">
                        {/* Left: Number (top-left) and Category/Title */}
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {/* Number - small, light gray, vertically aligned with category */}
                          <span className="text-xs text-secondary-400 flex-shrink-0 pt-0.5">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            {/* Category */}
                            <div className="mb-1.5 flex items-center gap-2">
                              <span
                                className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                  item.categoryColor === 'blue'
                                    ? 'text-blue-600 bg-blue-50'
                                    : item.categoryColor === 'teal'
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-secondary-600 bg-secondary-50'
                                }`}
                              >
                                {item.category}
                              </span>
                              {isAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setEditingNews(item);
                                    setShowNewsModal(true);
                                  }}
                                  className="p-1 hover:bg-primary-100 rounded transition-colors z-10 relative"
                                  aria-label="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-primary-600" />
                                </button>
                              )}
                            </div>
                            {/* Title */}
                            <h3 className="text-sm text-secondary-900 font-medium leading-relaxed">
                              {item.title}
                            </h3>
                          </div>
                        </div>

                        {/* Right: Date - right aligned */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-xs text-secondary-600 whitespace-nowrap">
                            {item.date}
                          </span>
                          {/* Views 제거됨 */}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination - Placeholder for future implementation */}
          {filteredNews.length > 10 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                {/* Pagination buttons can be added here */}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-white border border-secondary-200 rounded-full flex items-center justify-center shadow-lg hover:bg-secondary-50 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 text-secondary-700" />
        </button>
      )}

      {/* News Edit Modal */}
      {isAdmin && (
        <NewsEditModal
          isOpen={showNewsModal}
          onClose={() => {
            setShowNewsModal(false);
            setEditingNews(null);
          }}
          onSave={handleRefreshNews}
          newsItem={editingNews}
          mediaItems={mediaItems}
        />
      )}
    </div>
  )
}

