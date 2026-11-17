import { IProject } from '@/@types/projects.entity'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

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

const fetchProjects = async (): Promise<IProject[]> => {
  const response = await fetch(REPOS_URL)

  if (!response.ok) {
    throw new Error(`GitHub API respondeu ${response.status}.`)
  }

  return (await response.json()) as IProject[]
}

export default function useFetchProjects() {
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

  const projects = useMemo(
    () =>
      (data ?? []).filter(
        project => !project.fork && !IGNORED_REPOS.includes(project.name)
      ),
    [data]
  )

  return {
    projects,
    // Mesmo critério da store de idioma: sem dados e sem erro = carregando.
    isLoading: data === undefined && error === null,
    error,
    retry: refetch
  }
}
