import React from 'react'
import IFrame from './Iframe'

const Video = () => {
  const videoId = "9OqHsqdkDnk"
  const src = `https://www.youtube.com/embed/${videoId}`;
  const title = "YouTube video player";
  const options = "frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' allowfullscreen"

  return (
    <IFrame
      src={src}
      title={title}
      options={options}
    />
  )
};

export default Video
