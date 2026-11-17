import styled, { css, keyframes } from 'styled-components'

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`

/**
 * Neutral gray at low opacity so the same skeleton reads well on the light and
 * on the dark theme without duplicating a palette per mode.
 */
const baseSkeleton = css`
  background-color: rgba(128, 128, 128, 0.18);
  background-image: linear-gradient(
    90deg,
    rgba(128, 128, 128, 0) 0%,
    rgba(128, 128, 128, 0.3) 50%,
    rgba(128, 128, 128, 0) 100%
  );
  background-size: 200% 100%;
  background-repeat: no-repeat;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  pointer-events: none;
  user-select: none;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const SkeletonBlock = styled.div<{
  $width?: string
  $height?: string
  $radius?: string
}>`
  ${baseSkeleton}
  width: ${({ $width }) => $width ?? '100%'};
  height: ${({ $height }) => $height ?? '1rem'};
  border-radius: ${({ $radius }) => $radius ?? '8px'};
  display: block;
`

export const SkeletonCircle = styled.div<{ $size?: string }>`
  ${baseSkeleton}
  width: ${({ $size }) => $size ?? '48px'};
  height: ${({ $size }) => $size ?? '48px'};
  border-radius: 50%;
  flex-shrink: 0;
`

export const SkeletonLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`

export const SkeletonRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`

export const SkeletonCardShell = styled.div<{
  $width?: string
  $height?: string
}>`
  width: ${({ $width }) => $width ?? '100%'};
  height: ${({ $height }) => $height ?? 'auto'};
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(160, 160, 160, 0.5);
  background: transparent;
  box-sizing: border-box;
`

export const SkeletonStatus = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`
