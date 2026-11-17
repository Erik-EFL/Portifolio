/**
 * Payload de https://api.github.com/users/{user}/repos (campos usados pelo app).
 * `id` chega como number e o campo de site é `homepage` — comparar com string
 * ou procurar `home_page` faz o card perder imagem e o botão "Site".
 */
export interface IProject {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  topics?: string[]
  fork: boolean
  visibility: string
  language: string | null
}
