import type { ImgHTMLAttributes } from 'react'
import { ImageStyle } from './Image.styled'

interface IImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'width' | 'height' | 'src'
  > {
  /** `alt` é obrigatório: toda imagem do site precisa de texto alternativo. */
  alt: string
  src?: string
  /** Aceita número (px) ou string CSS. */
  w?: string | number
  h?: string | number
}

/**
 * `<img>` com largura/altura em `w`/`h` e `decoding="async"`.
 *
 * `srcSet` só é repassado quando o chamador fornece um de verdade — antes o
 * componente apontava 1x e 2x para o MESMO arquivo, o que não fazia nada.
 */
function Image({ src, alt, w, h, loading = 'lazy', ...rest }: IImageProps) {
  return (
    <ImageStyle
      {...rest}
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading={loading}
      decoding='async'
    />
  )
}

export default Image
