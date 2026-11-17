import { StyledInput } from './Input.style'

interface InputProps {
  type?: string
  name?: string
  id?: string
  ariaLabel?: string
  ariaRequired?: boolean
  classNew?: string
  checked?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function Input({
  type,
  name,
  id,
  ariaLabel,
  ariaRequired,
  classNew,
  checked,
  onChange
}: InputProps) {
  return (
    <StyledInput
      className={classNew}
      type={type}
      name={name}
      id={id}
      aria-label={ariaLabel}
      aria-required={ariaRequired}
      checked={checked}
      onChange={onChange}
    />
  )
}
