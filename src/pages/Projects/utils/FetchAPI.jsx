
import { useCallback } from "react";
import { useQuery } from "react-query";

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
  //projetos que não quero que apareçam
  'Desafio-React',
  'GamingLife',
]

export default function useFetchLanguages() {
  const { data, isLoading, error } = useQuery("data", () =>
    fetch('https://api.github.com/users/Erik-EFL/repos').then((res) => res.json())
  );

  const filtered = useCallback(() => {
    const filtered = data.filter((project) => {
      return !projetos.includes(project.name)
    })

    const clearForkedProjects = filtered.filter((project) => {
      return !project.fork
    })
    return clearForkedProjects
  }, [data]);

  return { data, isLoading, error, filtered };
}
