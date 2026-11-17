import { DataSectionKey } from '@/services/portfolio-data.service'
import { isSkillsParitySection } from '@/services/skills-parity.service'
import { isRecord } from '@/utils/is-record'
import styles from './Admin.module.css'
import { ICONS, Icon } from './Admin.icons'
import { InlineInput, LevelPicker } from './Admin.fields'

export const ObjectListEditor = ({
  rows,
  label,
  disabled,
  onChange
}: {
  rows: unknown[]
  label: string
  disabled: boolean
  onChange: (rows: unknown[]) => void
}) => {
  const sample = rows.find(isRecord) ?? {}
  const levelKeys = Object.keys(sample).filter(
    key => typeof sample[key] === 'number'
  )

  const patchRow = (index: number, patch: Record<string, unknown>) => {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...(isRecord(row) ? row : {}), ...patch } : row
      )
    )
  }

  const addRow = () => {
    const template: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(sample)) {
      if (typeof value === 'string') template[key] = ''
      else if (typeof value === 'number') template[key] = 1
      else if (typeof value === 'boolean') template[key] = false
    }

    if (Object.keys(template).length === 0) template.name = ''
    onChange([...rows, template])
  }

  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>{label}</span>
      {rows.map((row, index) => {
        const record = isRecord(row) ? row : {}
        const rowName =
          typeof record.name === 'string' && record.name.trim()
            ? record.name
            : `item ${index + 1}`

        return (
          <div className={styles.skillRow} key={index}>
            <InlineInput
              value={typeof record.name === 'string' ? record.name : ''}
              label={`${label} ${index + 1}`}
              disabled={disabled}
              placeholder='Nome'
              onChange={name => patchRow(index, { name })}
            />
            <span className={styles.skillMeta}>
              {levelKeys.map(key => (
                <LevelPicker
                  key={key}
                  value={
                    typeof record[key] === 'number'
                      ? (record[key] as number)
                      : 1
                  }
                  label={rowName}
                  disabled={disabled}
                  onChange={level => patchRow(index, { [key]: level })}
                />
              ))}
              <button
                className={styles.iconButton}
                type='button'
                disabled={disabled}
                title='Remover'
                aria-label={`Remover ${label} ${index + 1}`}
                onClick={() =>
                  onChange(rows.filter((_, rowIndex) => rowIndex !== index))
                }
              >
                <Icon path={ICONS.trash} size={14} />
              </button>
            </span>
          </div>
        )
      })}
      <button
        className={styles.addRowButton}
        type='button'
        disabled={disabled}
        onClick={addRow}
      >
        <Icon path={ICONS.plus} size={14} />
        Adicionar {label.toLowerCase()}
      </button>
    </div>
  )
}

export const StringListEditor = ({
  lines,
  label,
  disabled,
  onChange
}: {
  lines: unknown[]
  label: string
  disabled: boolean
  onChange: (lines: unknown[]) => void
}) => (
  <div className={styles.fieldGroup}>
    <span className={styles.fieldLabel}>{label}</span>
    {lines.map((line, index) => (
      <div className={styles.inlineRow} key={index}>
        <textarea
          className={styles.inlineTextarea}
          rows={2}
          value={typeof line === 'string' ? line : JSON.stringify(line)}
          disabled={disabled}
          aria-label={`${label} ${index + 1}`}
          onChange={event =>
            onChange(
              lines.map((current, lineIndex) =>
                lineIndex === index ? event.currentTarget.value : current
              )
            )
          }
        />
        <button
          className={styles.iconButton}
          type='button'
          disabled={disabled}
          title='Remover linha'
          aria-label={`Remover ${label} ${index + 1}`}
          onClick={() =>
            onChange(lines.filter((_, lineIndex) => lineIndex !== index))
          }
        >
          <Icon path={ICONS.trash} size={14} />
        </button>
      </div>
    ))}
    <button
      className={styles.addRowButton}
      type='button'
      disabled={disabled}
      onClick={() => onChange([...lines, ''])}
    >
      <Icon path={ICONS.plus} size={14} />
      Adicionar linha em {label}
    </button>
  </div>
)

export const FieldEditor = ({
  field,
  value,
  disabled,
  onChange
}: {
  field: string
  value: unknown
  disabled: boolean
  onChange: (value: unknown) => void
}) => {
  if (Array.isArray(value)) {
    if (value.some(isRecord)) {
      return (
        <ObjectListEditor
          rows={value}
          label={field}
          disabled={disabled}
          onChange={onChange}
        />
      )
    }

    return (
      <StringListEditor
        lines={value}
        label={field}
        disabled={disabled}
        onChange={onChange}
      />
    )
  }

  if (typeof value === 'number') {
    return (
      <div className={styles.fieldInline}>
        <span className={styles.fieldLabel}>{field}</span>
        <input
          className={styles.inlineNumber}
          type='number'
          value={value}
          disabled={disabled}
          aria-label={field}
          onChange={event => onChange(Number(event.currentTarget.value))}
        />
      </div>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <label className={styles.fieldInline}>
        <input
          type='checkbox'
          checked={value}
          disabled={disabled}
          onChange={event => onChange(event.currentTarget.checked)}
        />
        <span className={styles.fieldLabel}>{field}</span>
      </label>
    )
  }

  return (
    <div className={styles.fieldInline}>
      <span className={styles.fieldLabel}>{field}</span>
      <InlineInput
        value={typeof value === 'string' ? value : JSON.stringify(value)}
        label={field}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  )
}

export const createItemTemplate = (
  key: DataSectionKey
): Record<string, unknown> => {
  switch (key) {
    case 'navigation':
    case 'footer':
      return { name: '', link: '' }
    case 'footerCopyright':
      return { copyright: '' }
    case 'home':
      return { circle: '', name: '', title: '', description: [''], link: '' }
    case 'about':
      return { description: [''] }
    default:
      return {
        title: 'Nova categoria',
        skills: [{ name: 'Nova habilidade', level: 3 }]
      }
  }
}

export const ItemEditor = ({
  item,
  index,
  disabled,
  onChange,
  onRemove
}: {
  item: unknown
  index: number
  disabled: boolean
  onChange: (item: Record<string, unknown>) => void
  onRemove: () => void
}) => {
  const record = isRecord(item) ? item : {}
  const hasTitle = typeof record.title === 'string'

  return (
    <div className={styles.itemCard}>
      <div className={styles.itemHead}>
        <span className={styles.categoryTitle}>
          <span className={styles.categoryDot} aria-hidden='true' />
          {hasTitle ? (
            <InlineInput
              value={record.title as string}
              label='Título do item'
              disabled={disabled}
              placeholder='Título'
              onChange={title => onChange({ ...record, title })}
            />
          ) : (
            <span className={styles.itemLabel}>Item {index + 1}</span>
          )}
        </span>
        <button
          className={styles.iconButton}
          type='button'
          disabled={disabled}
          title='Remover item'
          aria-label={`Remover item ${index + 1}`}
          onClick={onRemove}
        >
          <Icon path={ICONS.trash} size={14} />
        </button>
      </div>
      {Object.entries(record)
        .filter(([field]) => !(hasTitle && field === 'title'))
        .map(([field, fieldValue]) => (
          <FieldEditor
            key={field}
            field={field}
            value={fieldValue}
            disabled={disabled}
            onChange={next =>
              onChange({
                ...record,
                [field]: next
              })
            }
          />
        ))}
    </div>
  )
}

export const VisualEditor = ({
  keyName,
  section,
  disabled,
  onChange
}: {
  keyName: DataSectionKey
  section: unknown
  disabled: boolean
  onChange: (section: unknown) => void
}) => {
  if (!Array.isArray(section)) {
    return (
      <p className={styles.previewEmpty}>
        Corrija o JSON ao lado para voltar a editar esta seção visualmente.
      </p>
    )
  }

  const updateLocale = (
    localeIndex: number,
    updater: (locale: Record<string, unknown>) => Record<string, unknown>
  ) =>
    onChange(
      section.map((locale, index) =>
        index === localeIndex ? updater(isRecord(locale) ? locale : {}) : locale
      )
    )

  const addLabel =
    keyName === 'skills' || keyName === 'skillsDetails' ? 'categoria' : 'item'
  const firstLocale = isRecord(section[0]) ? section[0] : {}
  const firstLanguage =
    typeof firstLocale.language === 'string' ? firstLocale.language : 'bloco 1'
  // Em skills/skillsDetails a categoria nova tem que entrar nos dois idiomas:
  // criar só no primeiro é como as listas desalinhavam.
  const addToEveryLanguage = isSkillsParitySection(keyName)

  const addToAllLanguages = () =>
    onChange(
      section.map(locale => {
        const current = isRecord(locale) ? locale : {}

        return {
          ...current,
          items: [
            ...(Array.isArray(current.items) ? current.items : []),
            createItemTemplate(keyName)
          ]
        }
      })
    )

  return (
    <div className={styles.visualEditor}>
      <div className={styles.columnHead}>
        <span className={styles.columnTitle}>Editor visual</span>
        <button
          className={styles.addHeadButton}
          type='button'
          disabled={disabled}
          title={
            addToEveryLanguage
              ? `Adicionar ${addLabel} em todos os idiomas`
              : `Adicionar ${addLabel} no bloco ${firstLanguage}`
          }
          onClick={() =>
            addToEveryLanguage
              ? addToAllLanguages()
              : updateLocale(0, current => ({
                  ...current,
                  items: [
                    ...(Array.isArray(current.items) ? current.items : []),
                    createItemTemplate(keyName)
                  ]
                }))
          }
        >
          <Icon path={ICONS.plus} size={14} />
          Adicionar {addLabel}
          {addToEveryLanguage
            ? ' · todos os idiomas'
            : section.length > 1
            ? ` · ${firstLanguage}`
            : ''}
        </button>
      </div>

      <div className={styles.previewStack}>
        {section.map((locale, localeIndex) => {
          const record = isRecord(locale) ? locale : {}
          const items = Array.isArray(record.items) ? record.items : []

          return (
            <div className={styles.previewLang} key={localeIndex}>
              <div className={styles.previewLangHead}>
                <span className={styles.chip}>
                  {typeof record.language === 'string'
                    ? record.language
                    : `bloco ${localeIndex + 1}`}
                </span>
                <span className={styles.categoryCount}>
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              {items.length === 0 && (
                <p className={styles.previewEmpty}>
                  Nenhum item neste idioma. Crie o primeiro com o botão abaixo.
                </p>
              )}
              {items.map((item, itemIndex) => (
                <ItemEditor
                  key={itemIndex}
                  item={item}
                  index={itemIndex}
                  disabled={disabled}
                  onChange={next =>
                    updateLocale(localeIndex, current => {
                      const nextItems = Array.isArray(current.items)
                        ? [...current.items]
                        : []
                      nextItems[itemIndex] = next
                      return { ...current, items: nextItems }
                    })
                  }
                  onRemove={() =>
                    updateLocale(localeIndex, current => ({
                      ...current,
                      items: (Array.isArray(current.items)
                        ? current.items
                        : []
                      ).filter((_, index) => index !== itemIndex)
                    }))
                  }
                />
              ))}
              <button
                className={styles.addRowButton}
                type='button'
                disabled={disabled}
                onClick={() =>
                  updateLocale(localeIndex, current => ({
                    ...current,
                    items: [
                      ...(Array.isArray(current.items) ? current.items : []),
                      createItemTemplate(keyName)
                    ]
                  }))
                }
              >
                <Icon path={ICONS.plus} size={14} />
                Adicionar {addLabel}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Login ---------- */
