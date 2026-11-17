import React from 'react'
export interface ErikFlIconProps {
  className?: string
  size?: number
  title?: string
}
export function ErikFlIcon({
  className,
  size = 160,
  title = 'ERIK-FL'
}: ErikFlIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 300" width="100%" height="100%">
  <g stroke="#FF8C00" stroke-linecap="round" stroke-linejoin="round">
    <g fill="none" stroke-width="2.5">
      <path d="M 60 210 C 30 180, 15 130, 20 90 C 25 45, 60 20, 100 20 C 145 20, 180 50, 180 95 C 180 135, 165 180, 140 210" />
      <path d="M 63 207 C 35 175, 20 135, 25 85 C 32 40, 68 15, 102 15 C 148 15, 185 45, 184 90 C 183 130, 168 175, 137 207" />
      <path d="M 58 212 C 28 178, 12 125, 18 92 C 23 48, 58 22, 98 22 C 140 22, 176 52, 176 98 C 176 138, 162 182, 142 212" />
      <path d="M 70 130 Q 80 140, 90 190 Q 95 210, 100 210 Q 105 210, 110 190 Q 120 140, 130 130 Q 115 145, 100 130 Q 85 145, 70 130 Z" />
      <path d="M 72 132 Q 82 142, 92 188 Q 100 208, 108 188 Q 118 142, 128 132 Q 113 147, 100 132 Q 87 147, 72 132" />
      <path d="M 100 130 L 100 210" />
      <path d="M 60 215 C 75 220, 125 220, 140 215 C 135 228, 65 228, 60 215 Z" />
      <path d="M 62 225 C 77 232, 123 232, 138 225 C 133 238, 67 238, 62 225 Z" />
      <path d="M 65 235 C 80 242, 120 242, 135 235 C 130 248, 70 248, 65 235 Z" />
      <path d="M 70 245 C 83 252, 117 252, 130 245 C 125 258, 75 258, 70 245 Z" />
      <path d="M 75 255 C 85 262, 115 262, 125 255 C 120 266, 80 266, 75 255 Z" />
      <path d="M 82 265 C 90 270, 110 270, 118 265 C 112 273, 88 273, 82 265 Z" />
    </g>

    <text x="220" y="200" fill="#FF8C00" stroke="none" font-family="&#39;Chalkboard&#39;, &#39;Comic Sans MS&#39;, cursive, sans-serif" font-size="95" font-weight="bold" letter-spacing="4">ERIK-EFL</text>
  </g>
</svg>
  )
}
export default ErikFlIcon
