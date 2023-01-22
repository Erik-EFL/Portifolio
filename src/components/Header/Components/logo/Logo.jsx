import React from 'react';
import LogoStyle from './Logo.style';
import logo from '../../../../Data/Image/Logo.webp';
import Image from '../../../ImageContainer/Image';

export default function Logo() {
  return (
    <LogoStyle className='logo'>
        <Image
          src={logo}
          alt={"Logotipo"}
          loading='lazy'
          w="100"
          h="200"
        />
    </LogoStyle>
  );
}
