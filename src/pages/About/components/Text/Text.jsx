import React from 'react'
import useChangeLanguage from '../../../../Hooks/useChangeLanguage'
import TextArea from './TextArea'

const Text = () => {
  const { data } = useChangeLanguage()

  const { about } = data

  return (
    <TextArea className='textAbout'>
      {about?.map((item, index) => {
        return (
          <p key={index}>
            {item}
          </p>
        )
      })}
    </TextArea>
  )
}

export default Text
