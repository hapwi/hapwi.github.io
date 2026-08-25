import { fetchGitHubRepoDefaultBranch, fetchGitHubRepoTree } from '@/lib/github'

export type RepoFile = {
  path: string
  name: string
  extension: string
  size: number | null
}

export type RepoListing = {
  currentPath: string
  folders: Array<{ name: string; path: string }>
  files: RepoFile[]
}

type CachedTree = {
  branch: string
  updatedAt: number
  files: RepoFile[]
}

type CachedSource = {
  text: string
  updatedAt: number
}

const TREE_CACHE_TTL_MS = 1000 * 60 * 30
const SOURCE_CACHE_MAX_ENTRIES = 25
const MAX_PREVIEW_BYTES = 1_000_000

const BINARY_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ico',
  'zip',
  '7z',
  'rar',
  'pdf',
  'exe',
  'dll',
  'dmg',
  'woff',
  'woff2',
  'ttf',
  'otf',
  'mp4',
  'mov',
  'mp3',
  'wav',
  'ogg',
  'wasm',
])

function treeCacheKey(owner: string, repo: string) {
  return `github:repo-tree:v1:${owner}/${repo}`
}

function sourceCachePrefix(owner: string, repo: string) {
  return `github:raw-source:v1:${owner}/${repo}:`
}

export function isProbablyBinary(extension: string) {
  return BINARY_EXTENSIONS.has(extension.toLowerCase())
}

export function canPreviewFile(file: RepoFile) {
  return (
    !isProbablyBinary(file.extension) &&
    (file.size == null || file.size <= MAX_PREVIEW_BYTES)
  )
}

export function previewDisabledReason(file: RepoFile) {
  if (file.size != null && file.size > MAX_PREVIEW_BYTES) {
    return 'Preview disabled for large files.'
  }
  if (isProbablyBinary(file.extension)) {
    return 'Preview unavailable for binary files.'
  }
  return null
}

export function readCachedTree(owner: string, repo: string) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(treeCacheKey(owner, repo))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedTree
    if (!parsed?.branch || !Array.isArray(parsed.files)) return null
    if (typeof parsed.updatedAt !== 'number') return null
    if (Date.now() - parsed.updatedAt >= TREE_CACHE_TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

export function writeCachedTree(
  owner: string,
  repo: string,
  value: CachedTree,
) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      treeCacheKey(owner, repo),
      JSON.stringify(value),
    )
  } catch {
    // ignore storage quota / serialization issues
  }
}

function readCachedSource(prefix: string, key: string) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(`${prefix}${key}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedSource
    if (!parsed?.text || typeof parsed.updatedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function pruneSourceCache(prefix: string) {
  if (typeof window === 'undefined') return
  try {
    const keys: Array<string> = []
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key && key.startsWith(prefix)) keys.push(key)
    }

    if (keys.length <= SOURCE_CACHE_MAX_ENTRIES) return

    const entries = keys
      .map((key) => {
        const urlPath = key.slice(prefix.length)
        return { key, cached: readCachedSource(prefix, urlPath) }
      })
      .filter((entry) => entry.cached)
      .sort((a, b) => (a.cached!.updatedAt ?? 0) - (b.cached!.updatedAt ?? 0))

    const removeCount = Math.max(0, entries.length - SOURCE_CACHE_MAX_ENTRIES)
    for (let index = 0; index < removeCount; index += 1) {
      window.localStorage.removeItem(entries[index]!.key)
    }
  } catch {
    // ignore cache eviction failures
  }
}

export function readCachedFileSource(owner: string, repo: string, key: string) {
  return readCachedSource(sourceCachePrefix(owner, repo), key)
}

export function writeCachedFileSource(
  owner: string,
  repo: string,
  key: string,
  text: string,
) {
  if (typeof window === 'undefined') return
  try {
    const prefix = sourceCachePrefix(owner, repo)
    const value: CachedSource = { text, updatedAt: Date.now() }
    window.localStorage.setItem(`${prefix}${key}`, JSON.stringify(value))
    pruneSourceCache(prefix)
  } catch {
    // ignore storage quota / serialization issues
  }
}

export async function loadRepoTree({
  owner,
  repo,
  signal,
}: {
  owner: string
  repo: string
  signal?: AbortSignal
}) {
  const cached = readCachedTree(owner, repo)
  if (cached) return cached

  const defaultBranch = await fetchGitHubRepoDefaultBranch({
    owner,
    repo,
    signal,
  })

  const tree = await fetchGitHubRepoTree({
    owner,
    repo,
    ref: defaultBranch,
    signal,
  })

  const files = tree.tree
    .filter((entry) => entry.type === 'blob' && entry.path)
    .map((entry) => {
      const name = entry.path.split('/').pop() ?? entry.path
      const extension = name.includes('.') ? (name.split('.').pop() ?? '') : ''
      return {
        path: entry.path,
        name,
        extension,
        size: typeof entry.size === 'number' ? entry.size : null,
      } satisfies RepoFile
    })
    .sort((a, b) => a.path.localeCompare(b.path))

  const value: CachedTree = {
    branch: defaultBranch,
    updatedAt: Date.now(),
    files,
  }
  writeCachedTree(owner, repo, value)
  return value
}

export function buildRepoListing(
  files: RepoFile[],
  currentPath: string,
): RepoListing {
  const normalizedPrefix = currentPath ? `${currentPath}/` : ''
  const folderSet = new Set<string>()
  const directFiles: RepoFile[] = []

  for (const repoFile of files) {
    if (normalizedPrefix && !repoFile.path.startsWith(normalizedPrefix))
      continue
    const remainder = normalizedPrefix
      ? repoFile.path.slice(normalizedPrefix.length)
      : repoFile.path
    if (!remainder) continue
    const [first, ...rest] = remainder.split('/')
    if (!first) continue

    if (rest.length > 0) {
      folderSet.add(first)
    } else {
      directFiles.push(repoFile)
    }
  }

  const folders = Array.from(folderSet)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      name,
      path: currentPath ? `${currentPath}/${name}` : name,
    }))

  directFiles.sort((a, b) => a.name.localeCompare(b.name))

  return { currentPath, folders, files: directFiles }
}
