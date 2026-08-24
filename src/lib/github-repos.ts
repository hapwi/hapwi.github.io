import { GITHUB_OWNER, buildGitHubApiUrl } from '@/lib/github'

export type GitHubPublicRepo = {
  name: string
  description: string | null
  htmlUrl: string
  homepage: string | null
  language: string | null
  fork: boolean
  archived: boolean
  stargazerCount: number
  updatedAt: number
}

type GitHubRepoListItem = {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  fork: boolean
  archived: boolean
  stargazers_count: number
  updated_at: string
  pushed_at: string
}

type CachedRepoList = {
  updatedAt: number
  repos: GitHubPublicRepo[]
}

const REPO_LIST_CACHE_KEY = `github:user-repos:v1:${GITHUB_OWNER}`
const REPO_LIST_CACHE_TTL_MS = 1000 * 60 * 30

function readCachedRepoList() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(REPO_LIST_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedRepoList
    if (!Array.isArray(parsed?.repos) || typeof parsed.updatedAt !== 'number') {
      return null
    }
    if (Date.now() - parsed.updatedAt >= REPO_LIST_CACHE_TTL_MS) return null
    return parsed.repos
  } catch {
    return null
  }
}

function writeCachedRepoList(repos: GitHubPublicRepo[]) {
  if (typeof window === 'undefined') return
  try {
    const value: CachedRepoList = { updatedAt: Date.now(), repos }
    window.localStorage.setItem(REPO_LIST_CACHE_KEY, JSON.stringify(value))
  } catch {
    // ignore quota / serialization issues
  }
}

function normalizeRepo(item: GitHubRepoListItem): GitHubPublicRepo {
  const updated = Date.parse(item.pushed_at || item.updated_at)
  return {
    name: item.name,
    description: item.description,
    htmlUrl: item.html_url,
    homepage: item.homepage,
    language: item.language,
    fork: item.fork,
    archived: item.archived,
    stargazerCount: item.stargazers_count ?? 0,
    updatedAt: Number.isFinite(updated) ? updated : 0,
  }
}

export function readCachedPublicRepos() {
  return readCachedRepoList()
}

export async function fetchPublicRepos({
  signal,
}: {
  signal?: AbortSignal
} = {}) {
  const response = await fetch(
    buildGitHubApiUrl(`/users/${GITHUB_OWNER}/repos?per_page=100&sort=updated`),
    {
      signal,
      headers: {
        Accept: 'application/vnd.github+json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(`GitHub repo list failed (${response.status})`)
  }

  const json = (await response.json()) as GitHubRepoListItem[]
  if (!Array.isArray(json)) {
    throw new Error('GitHub repo list response was not an array')
  }

  const repos = json.map(normalizeRepo)
  writeCachedRepoList(repos)
  return repos
}
