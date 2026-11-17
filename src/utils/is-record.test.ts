import { describe, expect, it } from 'vitest'
import { isRecord } from './is-record'

describe('isRecord', () => {
  it('aceita objetos simples', () => {
    expect(isRecord({ a: 1 })).toBe(true)
  })

  it('recusa null, arrays e primitivos', () => {
    expect(isRecord(null)).toBe(false)
    expect(isRecord(undefined)).toBe(false)
    expect(isRecord([1, 2])).toBe(false)
    expect(isRecord('texto')).toBe(false)
    expect(isRecord(42)).toBe(false)
  })
})
