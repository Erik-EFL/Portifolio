import React from 'react'
import { ImageStyle } from './Image.styled'
import useCheckRef from '../../Hooks/useCheckRef'

function Image({...props}) {
  const checkRef = useCheckRef(`${props.w}`, `${props.h}`)
  console.log(props.h) //
  return (
    <picture>
      <ImageStyle
        src={props.src}
        srcSet={props.src + ' 1x, ' + props.src + ' 2x'}
        {...props}
        ref={checkRef}
        loading='lazy'
        decoding="async"
        alt={props.alt}
        sx={props.sx}
        width={props.w}
        height={props.h}
      />
      <link rel="preload" href={props.src} as="image" imageSrcSet={props.src + ' 1x, ' + props.src + ' 2x'} />
    </picture>
  )
}

export default Image
