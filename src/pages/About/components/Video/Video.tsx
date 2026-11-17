import IFrame from './Iframe.styled'

const Video = () => {
  const videoId = 'xfgnUjnHIrY'
  const src = `https://www.youtube.com/embed/${videoId}`
  const title = 'YouTube video player'

  return (
    <IFrame
      src={src}
      title={title}
      allowFullScreen
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      loading='lazy'
    />
  )
}

export default Video
