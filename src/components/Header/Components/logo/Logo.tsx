import { ErikFlIcon } from '@/assets/icons/Logo';
import logo from '../../../../constant/Data/Image/Logo.webp';
import Image from '../../../ImageContainer/Image';
import LogoStyle from './Logo.style';

export default function Logo() {
  return (
    <LogoStyle className='logo'>
        <ErikFlIcon />
    </LogoStyle>
  );
}
