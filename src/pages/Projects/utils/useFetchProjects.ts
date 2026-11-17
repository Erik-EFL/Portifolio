import { IProject } from '@/@types/projects.entity'
import { isRecord } from '@/utils/is-record'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

const REPOS_URL = 'https://api.github.com/users/Erik-EFL/repos'

/** Repositórios que não são projetos de portfólio. */
const IGNORED_REPOS = [
  'projetos',
  'Estudos-para-Full-Stack',
  'Erik-EFL',
  'Erik',
  'CSS_For_ALL',
  'bootcamp-lauchbase',
  '100DaysOfCode',
  'AiqFome-clone',
  'Lesons-Learned-Project',
  'nlwReturn',
  'Desafio-React',
  'GamingLife'
]

/**
 * Valida o payload antes de virar tipo. Antes era um `as IProject[]` — cast que
 * não checa nada e deixava `undefined` atravessar até a tela.
 */
const isProject = (value: unknown): value is IProject => {
  if (!isRecord(value)) return false

  const { id, name, html_url: htmlUrl, fork } = value

  return (
    typeof id === 'number' &&
    typeof name === 'string' &&
    typeof htmlUrl === 'string' &&
    typeof fork === 'boolean'
  )
}

/**
 * Um repositório com formato inesperado é descartado em vez de derrubar a
 * página: o portfólio continua mostrando os outros. Payload que nem é lista é
 * erro de contrato e falha alto.
 */
export const parseProjects = (payload: unknown): IProject[] => {
  if (!Array.isArray(payload)) {
    throw new Error('GitHub API não devolveu uma lista de repositórios.')
  }

  return payload.filter(isProject)
}

/**
 * A API pública do GitHub permite 60 requisições por hora por IP (sem token).
 * Estourar esse limite derrubava a página de projetos inteira, então a última
 * lista boa fica salva e serve de reserva.
 */
const CACHE_KEY = 'portfolio-projects'
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

interface IProjectsCache {
  savedAt: number
  projects: IProject[]
}

const readCache = (): IProject[] | null => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null

    const { savedAt, projects } = parsed
    if (typeof savedAt !== 'number') return null
    if (Date.now() - savedAt > CACHE_MAX_AGE_MS) return null

    // o cache também pode estar corrompido: passa pelo mesmo parser
    const result = parseProjects(projects)
    return result.length > 0 ? result : null
  } catch {
    return null
  }
}

const writeCache = (projects: IProject[]): void => {
  try {
    const payload: IProjectsCache = { savedAt: Date.now(), projects }
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // storage cheio ou bloqueado: seguir sem cache
  }
}

const fetchProjects = async (): Promise<IProject[]> => {
  const response = await fetch(REPOS_URL)

  if (!response.ok) {
    throw new Error(`GitHub API respondeu ${response.status}.`)
  }

  const projects = parseProjects(await response.json())
  writeCache(projects)

  return projects
}

export default function useFetchProjects() {
  // Lido uma vez por montagem: é a reserva caso a API falhe agora.
  const [cached] = useState(readCache)

  const { data, error, refetch } = useQuery<IProject[]>({
    queryKey: ['github-repos'],
    queryFn: fetchProjects,
    retry: false,
    // Ver comentário na store de idioma: sem 'always' uma falha de rede fica
    // pausada como 'pending' e a página oscila entre skeleton e conteúdo.
    networkMode: 'always',
    // Uma busca por carga: a API do GitHub é limitada a 60 req/h por IP sem
    // autenticação e refetch em remontagem/foco estoura o limite à toa.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 10 * 60 * 1000
  })

  const projects = useMemo(() => {
    const fonte = data ?? cached ?? []

    return fonte.filter(
      project => !project.fork && !IGNORED_REPOS.includes(project.name)
    )
  }, [data, cached])

  const usandoCache = data === undefined && cached !== null

  return {
    projects,
    // Mesmo critério da store de idioma: sem dados e sem erro = carregando.
    // Com cache em mãos não há skeleton: a lista já está na tela.
    isLoading: data === undefined && error === null && !usandoCache,
    // Erro só quando não sobrou nada para mostrar; com cache a lista aparece e
    // a página avisa que está desatualizada.
    error: usandoCache ? null : error,
    isStale: Boolean(usandoCache && error),
    retry: refetch
  }
}
