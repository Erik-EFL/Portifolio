import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: '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'
})

const requestGit = await octokit.request('GET /orgs/{org}/repos{?type,sort,direction,per_page,page}', {
  org: 'Erik-EFL',
  per_page: 51,
  direction: 'desc',
  sort: 'created',
  type: 'all'
}).then((res) => res)

export default requestGit
