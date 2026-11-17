import IconsMenu from './Icons'

export default function SocialIcons() {
  return (
    <IconsMenu className='icon-social-media'>
      <a
        className='icons'
        href='https://www.linkedin.com/in/erikferreiralima/'
        target='_blank'
        aria-label='Linkedin Profile'
        rel='noreferrer'
      >
        <i className='icon ri-linkedin-fill' />
      </a>
      <a
        className='icons'
        href='https://github.com/Erik-EFL'
        target='_blank'
        aria-label='Github Profile'
        rel='noreferrer'
      >
        <i className='icon ri-github-line' />
      </a>
      <a
        className='icons'
        href='https://www.instagram.com/oi.erik.lima/'
        target='_blank'
        aria-label='Instagram Profile'
        rel='noreferrer'
      >
        <i className='icon ri-instagram-line' />
      </a>
    </IconsMenu>
  )
}
