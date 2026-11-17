import styles from './Admin.module.css'
import { LEVEL_MAX } from './Admin.utils'

export const LevelPicker = ({
  value,
  label,
  disabled,
  onChange
}: {
  value: number
  label: string
  disabled: boolean
  onChange: (level: number) => void
}) => {
  const current = Math.max(0, Math.min(LEVEL_MAX, Math.round(value)))
  const full = current === LEVEL_MAX

  return (
    <span className={styles.gauge}>
      {Array.from({ length: LEVEL_MAX }, (_, index) => {
        const level = index + 1
        return (
          <button
            key={level}
            className={`${styles.bar} ${styles.barButton} ${
              level <= current ? (full ? styles.barOnFull : styles.barOn) : ''
            }`}
            type='button'
            disabled={disabled}
            title={`Nível ${level} de ${LEVEL_MAX}`}
            aria-label={`${label}: nível ${level} de ${LEVEL_MAX}`}
            aria-pressed={level <= current}
            onClick={() => onChange(level === current ? level - 1 : level)}
          />
        )
      })}
      <span
        className={`${styles.gaugeValue} ${full ? styles.gaugeValueFull : ''}`}
      >
        {current}/{LEVEL_MAX}
      </span>
    </span>
  )
}

export const InlineInput = ({
  value,
  label,
  disabled,
  placeholder,
  onChange
}: {
  value: string
  label: string
  disabled: boolean
  placeholder?: string
  onChange: (value: string) => void
}) => (
  <input
    className={styles.inlineInput}
    type='text'
    value={value}
    disabled={disabled}
    aria-label={label}
    placeholder={placeholder}
    onChange={event => onChange(event.currentTarget.value)}
  />
)
