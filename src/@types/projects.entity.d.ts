export interface IProject {
  id: string;
  name: string;
  description: string;
  html_url: string;
  home_page: string;
  topics: string[];
  fork: boolean;
  visibility: string;
  language: string;
}
