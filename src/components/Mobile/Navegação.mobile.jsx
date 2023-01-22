import React from 'react';
import { BiBookOpen, BiBriefcase, BiComment, BiHome } from "react-icons/bi";
import { NavLink } from 'react-router-dom';
import useChangeLanguage from '../../Hooks/useChangeLanguage';
import NavMenu from './Navegação.mobile.style';


export default function NavMobile() {
  const { data } = useChangeLanguage();

  const header = data?.header;

  if (!header) return null;

  return (
    <NavMenu className='bottonMenu'>
      <NavLink
        to="/"
        value='Home'
        className="mobileLinks"
      >
        <h1><BiHome /></h1>
        <p>{header.link1}</p>
      </NavLink>
      <NavLink
        to="/about"
        value='About'
        className="mobileLinks"
      >
        <h1><BiComment /></h1>
        <p>{header.link2}</p>
      </NavLink>
      <NavLink
        to="/skills"
        value='Skills'
        className="mobileLinks"
      >
       <h1><BiBriefcase /></h1>
       <p>{header.link3}</p>
      </NavLink>
      <NavLink
        to="/projects"
        value='Projects'
        className="mobileLinks"
      >
        <h1><BiBookOpen /></h1>
        <p>{header.link4}</p>
      </NavLink>
    </NavMenu>
  );
}
