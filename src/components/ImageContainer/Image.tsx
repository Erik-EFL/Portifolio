import { ImageStyle } from './Image.styled'

function Image({ ...props }) {
  return (
    <>
      <ImageStyle
        src={props.src}
        srcSet={props.src + ' 1x, ' + props.src + ' 2x'}
        {...props}
        decoding='async'
        alt={props.alt}
        width={props.w}
        height={props.h}
      />
    </>
  )
}

export default Image
