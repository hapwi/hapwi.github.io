export type GitHubRepoRef = {
  owner: string
  repo: string
  ref: string
}

export type GitHubTreeEntry = {
  path: string
  mode: string
  type: 'blob' | 'tree' | string
  sha: string
  size?: number
  url: string
}

export type GitHubTreeResponse = {
  sha: string
  truncated: boolean
  tree: GitHubTreeEntry[]
}

export type GitHubRepoResponse = {
  default_branch: string
  pushed_at?: string
  updated_at?: string
}

function encodePathPreservingSlashes(path: string) {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function buildGitHubApiUrl(pathname: string) {
  const base = 'https://api.github.com'
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${base}${normalized}`
}

export function buildRawGitHubUrl({
  owner,
  repo,
  ref,
  filePath,
}: {
  owner: string
  repo: string
  ref: string
  filePath: string
}) {
  const encodedRef = encodeURIComponent(ref)
  const encodedPath = encodePathPreservingSlashes(filePath)
  return `https://raw.githubusercontent.com/${owner}/${repo}/${encodedRef}/${encodedPath}`
}

export function buildGitHubBlobUrl({
  owner,
  repo,
  ref,
  filePath,
}: {
  owner: string
  repo: string
  ref: string
  filePath: string
}) {
  const encodedRef = encodeURIComponent(ref)
  const encodedPath = encodePathPreservingSlashes(filePath)
  return `https://github.com/${owner}/${repo}/blob/${encodedRef}/${encodedPath}`
}

export async function fetchGitHubRepoDefaultBranch({
  owner,
  repo,
  signal,
}: {
  owner: string
  repo: string
  signal?: AbortSignal
}) {
  const response = await fetch(
    buildGitHubApiUrl(`/repos/${owner}/${repo}`),
    {
      signal,
      headers: {
        Accept: 'application/vnd.github+json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(`GitHub repo request failed (${response.status})`)
  }

  const json = (await response.json()) as GitHubRepoResponse
  if (!json?.default_branch) {
    throw new Error('GitHub repo response missing default_branch')
  }

  return json.default_branch
}

export async function fetchGitHubRepoInfo({
  owner,
  repo,
  signal,
}: {
  owner: string
  repo: string
  signal?: AbortSignal
}) {
  const response = await fetch(
    buildGitHubApiUrl(`/repos/${owner}/${repo}`),
    {
      signal,
      headers: {
        Accept: 'application/vnd.github+json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(`GitHub repo request failed (${response.status})`)
  }

  const json = (await response.json()) as GitHubRepoResponse
  if (!json?.default_branch) {
    throw new Error('GitHub repo response missing default_branch')
  }

  return json
}

export async function fetchGitHubRepoTree({
  owner,
  repo,
  ref,
  signal,
}: {
  owner: string
  repo: string
  ref: string
  signal?: AbortSignal
}) {
  const response = await fetch(
    buildGitHubApiUrl(
      `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`,
    ),
    {
      signal,
      headers: {
        Accept: 'application/vnd.github+json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(`GitHub tree request failed (${response.status})`)
  }

  const json = (await response.json()) as GitHubTreeResponse
  if (!Array.isArray(json?.tree)) {
    throw new Error('GitHub tree response missing tree')
  }

  return json
}
