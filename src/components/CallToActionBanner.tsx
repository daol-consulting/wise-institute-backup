import Link from 'next/link'
import { ReactNode } from 'react'

type Action = {
  label: string
  href: string
  icon?: ReactNode
}

type Props = {
  title: string
  description: string
  primaryAction: Action
  secondaryAction?: Action
  primaryButtonClassName?: string
  secondaryButtonClassName?: string
  containerClassName?: string
  dataAos?: string
}

const isExternalHref = (href: string) => href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')

export default function CallToActionBanner({
  title,
  description,
  primaryAction,
  secondaryAction,
  primaryButtonClassName,
  secondaryButtonClassName,
  containerClassName,
  dataAos = 'fade-up',
}: Props) {
  const renderAction = (action: Action, className: string) => {
    if (isExternalHref(action.href)) {
      const isHttp = action.href.startsWith('http')
      return (
        <a
          href={action.href}
          className={className}
          target={isHttp ? '_blank' : undefined}
          rel={isHttp ? 'noopener noreferrer' : undefined}
        >
          {action.icon}
          {action.label}
        </a>
      )
    }

    return (
      <Link href={action.href} className={className}>
        {action.icon}
        {action.label}
      </Link>
    )
  }

  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-secondary-900" />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl animate-pulse" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl animate-pulse" />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(#ffffff14 1px, transparent 1px)', backgroundSize: '18px 18px' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <div className="mx-auto max-w-3xl rounded-2xl p-[1px] bg-gradient-to-r from-white/30 via-white/20 to-white/30">
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm">
            <div className={`space-y-4 sm:space-y-6 lg:space-y-8 px-6 sm:px-10 py-10 ${containerClassName ?? ''}`} data-aos={dataAos}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight text-white">
                {title}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                {description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4">
                {renderAction(
                  primaryAction,
                  primaryButtonClassName ??
                    'inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 sm:px-10 py-4 sm:py-5 text-primary-700 font-semibold shadow-sm ring-1 ring-inset ring-white/60 hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-200 transition-colors'
                )}
                {secondaryAction
                  ? renderAction(
                      secondaryAction,
                      secondaryButtonClassName ??
                        'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 text-white px-8 sm:px-10 py-4 sm:py-5 font-semibold hover:bg-white hover:text-primary-700 transition-colors'
                    )
                  : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

