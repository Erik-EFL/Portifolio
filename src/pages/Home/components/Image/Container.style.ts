import styled from 'styled-components'
import Image from '@/components/ImageContainer/Image'

/**
 * Foto do hero. O círculo de 500px vinha de um `style={{...}}` inline com
 * `display: flex` num `<img>`; agora é só o que importa visualmente.
 */
export const ProfileImage = styled(Image)`
  width: 500px;
  height: 500px;
  max-width: 100%;
  border-radius: 50%;
  box-shadow: 2px 2px 50px 0 rgba(0, 0, 0, 0.5);
  object-fit: cover;

  /* 500px não cabe no hero empilhado do mobile */
  @media (max-width: 900px) {
    width: 240px;
    height: 240px;
  }
`
