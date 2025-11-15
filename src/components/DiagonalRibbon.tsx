import React from 'react'

type Props = {
  wrapperClassName?: string
  style?: React.CSSProperties
  widthClass?: string
  heightClass?: string
  colorClass?: string
  rotateClass?: string
  roundedClass?: string
  shadowClass?: string
}

export default function DiagonalRibbon({
  wrapperClassName = '',
  style,
  widthClass = 'w-full',
  heightClass = 'h-6',
  colorClass = 'bg-primary-600',
  rotateClass = 'rotate-[-3deg]',
  shadowClass = ''
}: Props) {
  return (
    <div className={wrapperClassName} style={style}>
      <div className={`${widthClass} ${heightClass} ${colorClass} ${shadowClass} ${rotateClass}`} />
    </div>
  )
}
