import React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  eyebrow: string
  title: string
  description?: string
  className?: string
  eyebrowClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  dataAos?: string
  dataAosDelay?: number | string
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  eyebrowClassName = 'uppercase tracking-wider text-primary-600 font-bold text-sm sm:text-base lg:text-lg mb-3',
  titleClassName = 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-secondary-800 leading-tight',
  descriptionClassName = 'mt-4 text-base sm:text-lg lg:text-xl text-secondary-600',
  dataAos,
  dataAosDelay,
}: Props) {
  return (
    <div
      className={cn('mb-8 lg:mb-12 max-w-3xl', className)}
      data-aos={dataAos}
      data-aos-delay={dataAosDelay}
    >
      <p className={eyebrowClassName}>{eyebrow}</p>
      <h2 className={titleClassName}>{title}</h2>
      {description ? <p className={descriptionClassName}>{description}</p> : null}
    </div>
  )
}
