import React, { useEffect } from 'react';
import useChangeLanguage from '../../../Hooks/useChangeLanguage';
import usePersistedState from '../../../Hooks/usePersistedState';
import br from '../../../Data/Image/icons8-brazil-48.webp';
import us from '../../../Data/Image/icons8-usa-48.webp';
import { ToggleContainer } from './toggle.styled';
import Image from '../../ImageContainer/Image';
import { StyledInput } from '../../Input/Input.style';

export default function CustomizedSwitches() {
  const [verify, setVerify] = React.useState(false)

  useEffect(() => {
    const inputState = document.querySelector('.check');

    if (inputState.checked) {
      setVerify(true);
    } else {
      setVerify(false);
    }
  }, []);

  const [isChecked, setIsChecked] = usePersistedState('input', verify);
  const { handleChangeLanguage } = useChangeLanguage();

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    handleChangeLanguage(isChecked ? 'ptBR' : 'enUS');
    window.location.reload();
  }

  return (
    <ToggleContainer className='toggleTheme'>
      <Image src={br} w="30" h="30" alt="imagem de bandeira do brasil" />
      <StyledInput
        type={"checkbox"}
        className='check'
        name={'language'}
        ariaLabel={'language'}
        checked={isChecked}
        onChange={handleChange}
      />
      <Image src={us} w="30" h="30" alt="imagem de bandeira dos estados unidos" />
    </ToggleContainer>
  );
}
