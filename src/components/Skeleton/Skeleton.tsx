import type { PropsWithChildren } from 'react'
import {
  SkeletonBlock,
  SkeletonCircle,
  SkeletonLines,
  SkeletonRow,
  SkeletonStatus,
  SrOnly
} from './Skeleton.styled'

type Size = string | number

const toCssSize = (value?: Size): string | undefined => {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

interface SkeletonBoxProps {
  width?: Size
  height?: Size
  radius?: Size
}

export const SkeletonBox = ({ width, height, radius }: SkeletonBoxProps) => (
  <SkeletonBlock
    $width={toCssSize(width)}
    $height={toCssSize(height)}
    $radius={toCssSize(radius)}
  />
)

interface SkeletonDotProps {
  size?: Size
}

export const SkeletonDot = ({ size }: SkeletonDotProps) => (
  <SkeletonCircle $size={toCssSize(size)} />
)

interface SkeletonTextProps {
  /** How many lines the placeholder paragraph should have. */
  lines?: number
  /** Width of each line; the last one is shortened when omitted. */
  widths?: Size[]
  lineHeight?: Size
  gap?: Size
}

export const SkeletonText = ({
  lines = 3,
  widths,
  lineHeight = 14,
  gap = 10
}: SkeletonTextProps) => (
  <SkeletonLines style={{ gap: toCssSize(gap) }}>
    {Array.from({ length: lines }, (_, index) => {
      const width =
        widths?.[index] ?? (index === lines - 1 && lines > 1 ? '62%' : '100%')

      return <SkeletonBox key={index} width={width} height={lineHeight} />
    })}
  </SkeletonLines>
)

interface SkeletonStatusRegionProps {
  label?: string
}

/**
 * Wraps a skeleton tree in a live region so screen readers announce the loading
 * state, while the visual placeholder stays purely decorative.
 */
export const SkeletonStatusRegion = ({
  label = 'Carregando conteúdo…',
  children
}: PropsWithChildren<SkeletonStatusRegionProps>) => (
  <SkeletonStatus role='status' aria-live='polite' aria-busy='true'>
    <SrOnly>{label}</SrOnly>
    {children}
  </SkeletonStatus>
)

export { SkeletonLines, SkeletonRow, SrOnly }
