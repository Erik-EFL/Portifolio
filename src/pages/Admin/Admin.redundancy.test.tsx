import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/utils'
import { screen } from '@testing-library/react'
import { RedundancyPanel } from './Admin.redundancy'
import type { RedundancyStatus } from '@/services/admin-api.service'

const mockGetRedundancy = vi.fn()

vi.mock('@/services/admin-api.service', () => ({
  REDUNDANCY_QUERY_KEY: ['redundancy-status'],
  getRedundancyStatus: () => mockGetRedundancy()
}))

const status = (patch: Partial<RedundancyStatus> = {}): RedundancyStatus => ({
  configured: true,
  rowsInMirror: 7,
  rowsInPrimary: 7,
  missingInMirror: [],
  extraInMirror: [],
  error: null,
  ...patch
})

describe('RedundancyPanel', () => {
  it('mostra as duas contagens quando o espelho acompanha a fonte', async () => {
    mockGetRedundancy.mockResolvedValueOnce(status())
    renderWithProviders(<RedundancyPanel />)

    expect(await screen.findByText('Redundância em dia')).toBeInTheDocument()
    expect(screen.getAllByText('7')).toHaveLength(2)
  })

  it('lista o que falta e o que sobra em vez de dizer apenas "divergente"', async () => {
    mockGetRedundancy.mockResolvedValueOnce(
      status({
        rowsInMirror: 5,
        missingInMirror: ['abc123'],
        extraInMirror: ['zzz999']
      })
    )
    renderWithProviders(<RedundancyPanel />)

    expect(
      await screen.findByText('Redundância divergente')
    ).toBeInTheDocument()
    expect(screen.getByText(/Faltando no espelho: abc123/)).toBeInTheDocument()
    expect(screen.getByText(/Sobrando no espelho: zzz999/)).toBeInTheDocument()
    expect(screen.getByText(/sync-supabase\.mjs/)).toBeInTheDocument()
  })

  it('explica a redundância desligada quando o servidor não tem as chaves', async () => {
    mockGetRedundancy.mockResolvedValueOnce(
      status({ configured: false, rowsInMirror: null, rowsInPrimary: null })
    )
    renderWithProviders(<RedundancyPanel />)

    expect(await screen.findByText('Redundância desligada')).toBeInTheDocument()
    expect(screen.getByText(/SUPABASE_SECRET_KEY/)).toBeInTheDocument()
  })

  it('mostra a falha do diagnóstico', async () => {
    mockGetRedundancy.mockRejectedValueOnce(new Error('Admin API falhou'))
    renderWithProviders(<RedundancyPanel />)

    expect(
      await screen.findByText('Redundância indisponível')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Não foi possível consultar o espelho/)
    ).toBeInTheDocument()
  })
})
