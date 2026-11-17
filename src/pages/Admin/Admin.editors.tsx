import type { Skill, SkillCategory } from '@/@types/portfolio.entity'
import { DataSectionKey } from '@/services/portfolio-data.service'
import { isSkillsSection } from '@/services/skills-model.service'
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

/**
 * Editor de skills na fonte única: o texto base (português) vale para os dois
 * idiomas e a tradução em inglês é opcional, linha a linha. Não existem mais
 * dois blocos para manter em sincronia.
 */
const SkillRowEditor = ({
  skill,
  index,
  comNivel,
  disabled,
  onChange,
  onRemove
}: {
  skill: Skill
  index: number
  comNivel: boolean
  disabled: boolean
  onChange: (next: Skill) => void
  onRemove: () => void
}) => {
  const nome = skill.name || `skill ${index + 1}`
  const traducao = skill.translations?.enUS ?? ''

  const setTraducao = (value: string) => {
    const translations = { ...(skill.translations ?? {}) }

    if (value.trim()) translations.enUS = value
    else delete translations.enUS

    onChange({
      ...skill,
      ...(Object.keys(translations).length > 0
        ? { translations }
        : { translations: undefined })
    })
  }

  return (
    <div className={styles.skillRow}>
      <InlineInput
        value={skill.name}
        label={`Nome da skill ${index + 1} (português)`}
        disabled={disabled}
        placeholder='Nome (vale para os dois idiomas)'
        onChange={name => onChange({ ...skill, name })}
      />
      <InlineInput
        value={traducao}
        label={`Tradução em inglês da skill ${index + 1}`}
        disabled={disabled}
        placeholder='Inglês (opcional)'
        onChange={setTraducao}
      />
      <span className={styles.skillMeta}>
        {comNivel && (
          <LevelPicker
            value={typeof skill.level === 'number' ? skill.level : 1}
            label={nome}
            disabled={disabled}
            onChange={level => onChange({ ...skill, level })}
          />
        )}
        <button
          className={styles.iconButton}
          type='button'
          disabled={disabled}
          title={`Remover ${nome}`}
          aria-label={`Remover ${nome}`}
          onClick={onRemove}
        >
          <Icon path={ICONS.trash} size={14} />
        </button>
      </span>
    </div>
  )
}

export const SkillsListEditor = ({
  categories,
  disabled,
  onChange
}: {
  categories: SkillCategory[]
  disabled: boolean
  onChange: (categories: SkillCategory[]) => void
}) => {
  const patchCategory = (index: number, patch: Partial<SkillCategory>) =>
    onChange(
      categories.map((category, categoryIndex) =>
        categoryIndex === index ? { ...category, ...patch } : category
      )
    )

  const setTraducaoCategoria = (index: number, value: string) => {
    const translations = { ...(categories[index].translations ?? {}) }

    if (value.trim()) translations.enUS = value
    else delete translations.enUS

    patchCategory(index, {
      translations:
        Object.keys(translations).length > 0 ? translations : undefined
    })
  }

  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>
        Uma lista só — o nome em português vale para o inglês também
      </span>
      {categories.map((category, index) => {
        const comNivel = category.skills.some(
          skill => typeof skill.level === 'number'
        )
        const nomeCategoria = category.title || `categoria ${index + 1}`

        return (
          <div className={styles.previewLang} key={index}>
            <div className={styles.inlineRow}>
              <InlineInput
                value={category.title}
                label={`Título da categoria ${index + 1} (português)`}
                disabled={disabled}
                placeholder='Categoria'
                onChange={title => patchCategory(index, { title })}
              />
              <InlineInput
                value={category.translations?.enUS ?? ''}
                label={`Tradução em inglês do título da categoria ${index + 1}`}
                disabled={disabled}
                placeholder='Inglês (opcional)'
                onChange={value => setTraducaoCategoria(index, value)}
              />
              <span className={styles.skillMeta}>
                <span className={styles.categoryCount}>
                  {category.skills.length}{' '}
                  {category.skills.length === 1 ? 'skill' : 'skills'}
                </span>
                <button
                  className={styles.iconButton}
                  type='button'
                  disabled={disabled}
                  title={`Remover ${nomeCategoria}`}
                  aria-label={`Remover ${nomeCategoria}`}
                  onClick={() =>
                    onChange(
                      categories.filter(
                        (_, categoryIndex) => categoryIndex !== index
                      )
                    )
                  }
                >
                  <Icon path={ICONS.trash} size={14} />
                </button>
              </span>
            </div>

            {category.skills.map((skill, skillIndex) => (
              <SkillRowEditor
                key={skillIndex}
                skill={skill}
                index={skillIndex}
                comNivel={comNivel}
                disabled={disabled}
                onChange={next =>
                  patchCategory(index, {
                    skills: category.skills.map((current, currentIndex) =>
                      currentIndex === skillIndex ? next : current
                    )
                  })
                }
                onRemove={() =>
                  patchCategory(index, {
                    skills: category.skills.filter(
                      (_, currentIndex) => currentIndex !== skillIndex
                    )
                  })
                }
              />
            ))}

            <button
              className={styles.addRowButton}
              type='button'
              disabled={disabled}
              onClick={() =>
                patchCategory(index, {
                  skills: [
                    ...category.skills,
                    comNivel ? { name: '', level: 1 } : { name: '' }
                  ]
                })
              }
            >
              <Icon path={ICONS.plus} size={14} />
              Adicionar skill
            </button>
          </div>
        )
      })}
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

  // skills e skillsDetails guardam uma lista única (uma fonte de verdade), sem
  // blocos por idioma.
  if (isSkillsSection(keyName)) {
    const categories = section.filter(isRecord) as unknown as SkillCategory[]

    return (
      <div className={styles.visualEditor}>
        <div className={styles.columnHead}>
          <span className={styles.columnTitle}>Editor visual</span>
          <button
            className={styles.addHeadButton}
            type='button'
            disabled={disabled}
            title='Adicionar categoria (vale para os dois idiomas)'
            onClick={() =>
              onChange([
                ...categories,
                createItemTemplate(keyName) as unknown as SkillCategory
              ])
            }
          >
            <Icon path={ICONS.plus} size={14} />
            Adicionar categoria
          </button>
        </div>
        <SkillsListEditor
          categories={categories}
          disabled={disabled}
          onChange={onChange}
        />
      </div>
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

  const addLabel = 'item'
  const firstLocale = isRecord(section[0]) ? section[0] : {}
  const firstLanguage =
    typeof firstLocale.language === 'string' ? firstLocale.language : 'bloco 1'

  return (
    <div className={styles.visualEditor}>
      <div className={styles.columnHead}>
        <span className={styles.columnTitle}>Editor visual</span>
        <button
          className={styles.addHeadButton}
          type='button'
          disabled={disabled}
          title={`Adicionar ${addLabel} no bloco ${firstLanguage}`}
          onClick={() =>
            updateLocale(0, current => ({
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
          {section.length > 1 ? ` · ${firstLanguage}` : ''}
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
