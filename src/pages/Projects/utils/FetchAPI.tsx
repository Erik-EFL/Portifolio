
import { IProject } from "@/@types/projects.entity";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const projetos = [
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
  'GamingLife',
]

export default function useFetchLanguages() {
  const { data, isLoading, error } = useQuery<IProject[]>({
    queryKey: ["data"],
    queryFn: () =>
      fetch('https://api.github.com/users/Erik-EFL/repos').then((res) => res.json() as Promise<IProject[]>),
  });

  const dataFiltered = data as IProject[]

  const filtered = useCallback(() => {
    const filtered = dataFiltered?.filter((project: IProject) => {
      return !projetos.includes(project.name)
    })

    const clearForkedProjects = filtered?.filter((project: IProject) => {
      return !project.fork
    })
    return clearForkedProjects
  }, [data]);

  return { data, isLoading, error, filtered };
}
