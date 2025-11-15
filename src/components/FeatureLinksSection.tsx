import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import DiagonalRibbon from '@/components/DiagonalRibbon'

type LinkCard = {
  imageSrc: string
  title: string
  href: string
  ctaLabel?: string
}

type Props = {
  eyebrow?: string
  title?: string
  description?: string
  leftCard: LinkCard
  rightCard: LinkCard
}

export default function FeatureLinksSection({
  eyebrow = 'CHANGES',
  title = 'Clinic impact & learning resources',
  description = 'Explore real clinical cases, residency highlights and media resources from WISE Institute.',
  leftCard,
  rightCard,
}: Props) {
  return (
    <section className="relative section-padding bg-[#f7f7f7]">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Header - First on mobile, Right on desktop */}
          <div className="lg:order-2" data-aos="fade-left">
            <SectionHeader
              eyebrow={eyebrow}
              title={title}
              description={description}
              dataAos="fade-up"
            />
          </div>

          {/* Cards - Second on mobile, Left on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:order-1">
            {[leftCard, rightCard].map((card, idx) => (
              <div key={idx} className="relative" data-aos="fade-up" data-aos-delay={idx * 100}>
                <Link href={card.href} className="block group">
                  {/* Image container with ribbon */}
                  <div className="relative mb-4">
                    <div className="relative z-10 overflow-hidden border border-secondary-100">
                      <div className="relative aspect-[4/3]">
                        <Image src={card.imageSrc} alt={card.title} fill className="object-cover group-hover:opacity-90 transition-opacity duration-300" />
                      </div>
                    </div>
                    {/* Background color mask to hide overlap */}
                    <div className="absolute -bottom-1 left-0 right-0 h-8 bg-[#f7f7f7] z-[5]" />
                    {/* Animated ribbon - appears on hover */}
                    <div className="absolute left-4 right-4 -bottom-2 z-0 pointer-events-none">
                      <div className="h-6 bg-primary-600 origin-left opacity-0 translate-y-[-12px] rotate-0 group-hover:opacity-100 group-hover:translate-y-[5px] group-hover:rotate-[-3deg] transition-all duration-300 ease-out" />
                    </div>
                  </div>
                  {/* Title */}
                  <div className="mb-2 sm:mb-3">
                    <div className="text-base sm:text-lg lg:text-xl text-secondary-900 font-bold">{card.title}</div>
                  </div>
                  {/* CTA Link */}
                  <div className="inline-flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                    <span>{card.ctaLabel ?? 'View all'}</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-600" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
