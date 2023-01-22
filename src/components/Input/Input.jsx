import React from 'react'
import { StyledInput } from './Input.style'

function Input({ ...props }) {
  return (
    <StyledInput
      type={props.type}
      name={props.name}
      id={props.id}
      aria-label={props.ariaLabel}
      aria-required={props.ariaRequired}
    />
  )
}

export default Input
