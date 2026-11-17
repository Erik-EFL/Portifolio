import Image from '../../../../components/ImageContainer/Image'
import { perfil } from '@/assets/Image/export-images'

function Container() {
  return (
    <Image
      src={perfil}
      alt='imagem de Erik lima'
      w='100%'
      h='100%'
      style={{
        borderRadius: '50%',
        boxShadow: ' 2px 2px 50px 0 rgba(0, 0, 0, 0.5)',
        width: '500px',
        height: '500px',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  )
}

export default Container
