import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Copy,
  Download,
  ExternalLink,
  FileText,
  Folder,
  GitBranch,
  Link2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'

import { CodeFileViewer } from '@/components/code-file-viewer'
import { FileIcon } from '@/components/file-icon'
import { RepoBreadcrumb } from '@/components/repo-breadcrumb'
import { formatFileSize } from '@/components/library/meta-columns'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  buildGitHubBlobUrl,
  buildRawGitHubUrl,
  fetchGitHubRepoDefaultBranch,
  fetchGitHubRepoTree,
} from '@/lib/github'

export const Route = createFileRoute('/bbpcn')({
  validateSearch: (search: Record<string, unknown>) => ({
    file: typeof search.file === 'string' ? search.file : undefined,
    path: typeof search.path === 'string' ? search.path : undefined,
  }),
  component: BbpcnRoute,
})

const OWNER = 'hapwi'
const REPO = 'bbpcn'

const TREE_CACHE_KEY = `github:repo-tree:v1:${OWNER}/${REPO}`
const TREE_CACHE_TTL_MS = 1000 * 60 * 30

const SOURCE_CACHE_PREFIX = `github:raw-source:v1:${OWNER}/${REPO}:`
const SOURCE_CACHE_MAX_ENTRIES = 25

const MAX_PREVIEW_BYTES = 1_000_000

type RepoFile = {
  path: string
  name: string
  extension: string
  size: number | null
}

type RepoListing = {
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

function isProbablyBinary(extension: string) {
  const ext = extension.toLowerCase()
  return new Set([
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
  ]).has(ext)
}

function readCachedTree() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(TREE_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedTree
    if (!parsed?.branch || !Array.isArray(parsed.files)) return null
    if (typeof parsed.updatedAt !== 'number') return null
    const isFresh = Date.now() - parsed.updatedAt < TREE_CACHE_TTL_MS
    if (!isFresh) return null
    return parsed
  } catch {
    return null
  }
}

function writeCachedTree(value: CachedTree) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TREE_CACHE_KEY, JSON.stringify(value))
  } catch {
    // ignore storage quota / serialization issues
  }
}

function readCachedSource(key: string) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(`${SOURCE_CACHE_PREFIX}${key}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedSource
    if (!parsed?.text || typeof parsed.updatedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function pruneSourceCache() {
  if (typeof window === 'undefined') return
  try {
    const keys: Array<string> = []
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key && key.startsWith(SOURCE_CACHE_PREFIX)) keys.push(key)
    }

    if (keys.length <= SOURCE_CACHE_MAX_ENTRIES) return

    const entries = keys
      .map((key) => {
        const urlPath = key.slice(SOURCE_CACHE_PREFIX.length)
        return { key, cached: readCachedSource(urlPath) }
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

function writeCachedSource(key: string, text: string) {
  if (typeof window === 'undefined') return
  try {
    const storageKey = `${SOURCE_CACHE_PREFIX}${key}`
    const value: CachedSource = { text, updatedAt: Date.now() }
    window.localStorage.setItem(storageKey, JSON.stringify(value))
    pruneSourceCache()
  } catch {
    // ignore storage quota / serialization issues
  }
}

function BbpcnRoute() {
  const { file, path } = Route.useSearch()

  const [branch, setBranch] = useState<string>('main')
  const [files, setFiles] = useState<RepoFile[]>([])
  const [isLoadingTree, setIsLoadingTree] = useState(false)
  const [treeError, setTreeError] = useState<string | null>(null)

  useEffect(() => {
    const cached = readCachedTree()
    if (cached) {
      setBranch(cached.branch)
      setFiles(cached.files)
      setTreeError(null)
      return
    }

    let cancelled = false
    const controller = new AbortController()

    async function loadTree() {
      setIsLoadingTree(true)
      setTreeError(null)

      try {
        const defaultBranch = await fetchGitHubRepoDefaultBranch({
          owner: OWNER,
          repo: REPO,
          signal: controller.signal,
        })

        const tree = await fetchGitHubRepoTree({
          owner: OWNER,
          repo: REPO,
          ref: defaultBranch,
          signal: controller.signal,
        })

        const repoFiles = tree.tree
          .filter((entry) => entry.type === 'blob' && entry.path)
          .map((entry) => {
            const name = entry.path.split('/').pop() ?? entry.path
            const extension = name.includes('.') ? name.split('.').pop() ?? '' : ''
            return {
              path: entry.path,
              name,
              extension,
              size: typeof entry.size === 'number' ? entry.size : null,
            } satisfies RepoFile
          })
          .sort((a, b) => a.path.localeCompare(b.path))

        if (!cancelled) {
          setBranch(defaultBranch)
          setFiles(repoFiles)
          writeCachedTree({
            branch: defaultBranch,
            updatedAt: Date.now(),
            files: repoFiles,
          })
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('Failed to load GitHub tree:', err)
        setTreeError(err instanceof Error ? err.message : 'Failed to load repo files')
      } finally {
        if (!cancelled) setIsLoadingTree(false)
      }
    }

    loadTree()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  const selectedPath =
    file && files.some((candidate) => candidate.path === file) ? file : null

  const activeFile = selectedPath
    ? files.find((candidate) => candidate.path === selectedPath) ?? null
    : null

  const currentPath = useMemo(() => {
    if (activeFile) {
      const parts = activeFile.path.split('/')
      if (parts.length <= 1) return ''
      return parts.slice(0, -1).join('/')
    }
    if (!path) return ''
    return path.replace(/^\/+|\/+$/g, '')
  }, [activeFile, path])

  const listing = useMemo((): RepoListing => {
    const normalizedPrefix = currentPath ? `${currentPath}/` : ''
    const folderSet = new Set<string>()
    const directFiles: RepoFile[] = []

    for (const repoFile of files) {
      if (normalizedPrefix && !repoFile.path.startsWith(normalizedPrefix)) continue
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
  }, [files, currentPath])

  const rawUrl = useMemo(() => {
    if (!activeFile) return null
    return buildRawGitHubUrl({
      owner: OWNER,
      repo: REPO,
      ref: branch,
      filePath: activeFile.path,
    })
  }, [activeFile, branch])

  const blobUrl = useMemo(() => {
    if (!activeFile) return null
    return buildGitHubBlobUrl({
      owner: OWNER,
      repo: REPO,
      ref: branch,
      filePath: activeFile.path,
    })
  }, [activeFile, branch])

  const canPreview =
    Boolean(activeFile) &&
    !isProbablyBinary(activeFile!.extension) &&
    (activeFile!.size == null || activeFile!.size <= MAX_PREVIEW_BYTES)

  const [fileSource, setFileSource] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    if (!rawUrl) return null
    return readCachedSource(rawUrl)?.text ?? null
  })
  const [isLoadingSource, setIsLoadingSource] = useState(false)
  const [sourceError, setSourceError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeFile || !rawUrl) {
      setFileSource(null)
      setSourceError(null)
      setIsLoadingSource(false)
      return
    }

    const resolvedRawUrl = rawUrl

    if (!canPreview) {
      setFileSource(null)
      setSourceError(
        activeFile.size != null && activeFile.size > MAX_PREVIEW_BYTES
          ? 'Preview disabled for large files.'
          : 'Preview unavailable for binary files.',
      )
      setIsLoadingSource(false)
      return
    }

    const cached = readCachedSource(resolvedRawUrl)
    const hasCachedSource = Boolean(cached?.text)

    if (hasCachedSource) {
      setFileSource(cached!.text)
      setSourceError(null)
    } else {
      setFileSource(null)
    }

    let cancelled = false
    const controller = new AbortController()

    async function fetchSource() {
      if (!hasCachedSource) {
        setIsLoadingSource(true)
        setSourceError(null)
      }

      try {
        const response = await fetch(resolvedRawUrl, {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!response.ok) {
          throw new Error(`Failed to load file (${response.status})`)
        }

        const text = await response.text()
        if (!cancelled) {
          setFileSource(text)
          setSourceError(null)
          writeCachedSource(resolvedRawUrl, text)
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('Failed to fetch raw source:', err)
        if (!hasCachedSource) {
          setFileSource(null)
          setSourceError(err instanceof Error ? err.message : 'Failed to load file contents')
        }
      } finally {
        if (!cancelled) setIsLoadingSource(false)
      }
    }

    fetchSource()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [activeFile, rawUrl, canPreview])

  const highlightLanguage = useMemo(() => {
    if (!activeFile) return 'txt'
    const extension = activeFile.extension.toLowerCase()
    if (extension === 'js') return 'javascript'
    if (extension === 'ts') return 'typescript'
    if (extension === 'md') return 'markdown'
    if (extension === 'yml') return 'yaml'
    return extension || 'txt'
  }, [activeFile])

  const languageLabel = activeFile?.extension
    ? activeFile.extension.toUpperCase()
    : 'FILE'

  const handleCopyUrl = async () => {
    if (!rawUrl) return
    try {
      await navigator.clipboard.writeText(rawUrl)
      toast.success('Raw URL copied to clipboard')
    } catch (err) {
      console.error('Failed to copy URL:', err)
      toast.error('Failed to copy raw URL')
    }
  }

  const handleCopyRaw = async () => {
    if (!fileSource) return
    try {
      await navigator.clipboard.writeText(fileSource)
      toast.success('Code copied to clipboard')
    } catch (err) {
      console.error('Failed to copy raw source:', err)
      toast.error('Failed to copy code')
    }
  }

  const handleOpenGitHub = () => {
    const url = blobUrl ?? `https://github.com/${OWNER}/${REPO}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const breadcrumbSegments = useMemo(() => {
    const segments: Array<{
      label: string
      href?: string
      search?: Record<string, unknown>
      isFile?: boolean
      filename?: string
    }> = [
      {
        label: 'bbpcn',
        href: '/bbpcn',
        search: { file: undefined, path: undefined },
      },
    ]

    const folderParts = currentPath ? currentPath.split('/').filter(Boolean) : []
    let runningPath = ''
    for (const part of folderParts) {
      runningPath = runningPath ? `${runningPath}/${part}` : part
      segments.push({
        label: part,
        href: '/bbpcn',
        search: { file: undefined, path: runningPath },
      })
    }

    if (activeFile) {
      segments.push({
        label: activeFile.name,
        isFile: true,
        filename: activeFile.name,
      })
    }

    return segments
  }, [currentPath, activeFile])

  // File list view when no file is selected
  if (!selectedPath) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <header className="space-y-4">
              <RepoBreadcrumb segments={breadcrumbSegments} />
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <GitBranch className="size-6" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    BBPCN Repository
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    Live view of <span className="font-medium text-foreground">{OWNER}/{REPO}</span> on GitHub
                  </p>
                </div>
              </div>
            </header>

            {/* Main content */}
            <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:gap-12">
              {/* File browser */}
              <section>
                <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-sm">
                        <GitBranch className="size-3.5 text-muted-foreground" />
                        <span className="font-medium">{branch}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {isLoadingTree
                        ? 'Loading...'
                        : `${listing.folders.length + listing.files.length} items`}
                    </span>
                  </div>

                  {treeError ? (
                    <div className="flex items-center gap-3 p-5 text-sm text-destructive">
                      <AlertCircle className="size-4 shrink-0" />
                      {treeError}
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50 editorial-stagger">
                      {listing.folders.map((folder) => (
                        <Link
                          key={folder.path}
                          to="/bbpcn"
                          search={{ file: undefined, path: folder.path }}
                          className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Folder className="size-4" />
                          </div>
                          <span className="flex-1 font-medium text-foreground group-hover:text-primary transition-colors">
                            {folder.name}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            folder
                          </span>
                        </Link>
                      ))}
                      {listing.files.map((item) => (
                        <Link
                          key={item.path}
                          to="/bbpcn"
                          search={{ file: item.path, path: undefined }}
                          className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50"
                        >
                          <FileIcon filename={item.name} extension={item.extension} size="sm" />
                          <span className="flex-1 font-medium text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {item.name}
                          </span>
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {item.size != null ? formatFileSize(item.size) : ''}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* About */}
                <div className="rounded-lg border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="size-4 text-muted-foreground" />
                    <h3 className="font-display text-sm font-semibold">About</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Live view of the public GitHub repository. Files and previews are fetched on demand and cached in your browser.
                  </p>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenGitHub}
                      className="gap-1.5"
                    >
                      <ExternalLink className="size-4" />
                      View on GitHub
                    </Button>
                  </div>
                </div>

                {/* Rate limit notice */}
                <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="size-4 text-violet-600 dark:text-violet-400" />
                    <h3 className="font-display text-sm font-semibold text-violet-600 dark:text-violet-400">API Note</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    GitHub's unauthenticated API is rate-limited. If the list fails to load, try again later.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // File viewer when a file is selected
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          {/* Header */}
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Link to="/bbpcn" search={{ file: undefined, path: currentPath || undefined }}>
                  <ArrowLeft className="size-4" />
                  <span className="hidden sm:inline">Back</span>
                </Link>
              </Button>
              <div className="h-5 w-px bg-border" />
              <RepoBreadcrumb segments={breadcrumbSegments} />
            </div>
          </header>

          {/* File viewer card */}
          <div className="flex min-h-0 max-h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
            {/* File header */}
            <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-5 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileIcon filename={activeFile?.name || ''} extension={activeFile?.extension} size="sm" />
                <div className="min-w-0">
                  <span className="font-medium truncate block">{activeFile?.name}</span>
                  <span className="text-xs text-muted-foreground truncate block">
                    {activeFile?.path}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums">
                  {activeFile?.size != null ? formatFileSize(activeFile.size) : ''}
                </span>
                <div className="hidden sm:block h-4 w-px bg-border mx-1" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyRaw}
                        disabled={!fileSource}
                        className="h-8 gap-1.5 text-xs"
                        aria-label="Copy file contents"
                      >
                        <Copy className="size-3.5" />
                        <span className="hidden sm:inline">Copy</span>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Copy file contents
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyUrl}
                      disabled={!rawUrl}
                      className="h-8 gap-1.5 text-xs"
                      aria-label="Copy raw file URL"
                    >
                      <Link2 className="size-3.5" />
                      <span className="hidden sm:inline">URL</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Copy raw URL
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleOpenGitHub}
                      className="h-8 gap-1.5 text-xs"
                      aria-label="Open file on GitHub"
                    >
                      <ExternalLink className="size-3.5" />
                      <span className="hidden sm:inline">GitHub</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    View on GitHub
                  </TooltipContent>
                </Tooltip>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  <a href={rawUrl ?? undefined} download aria-label="Download file">
                    <Download className="size-3.5" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Code viewer */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {activeFile ? (
                <CodeFileViewer
                  fileName={activeFile.name}
                  languageLabel={languageLabel}
                  highlightLanguage={highlightLanguage}
                  source={fileSource}
                  sourceUrl={rawUrl}
                  isLoading={isLoadingSource}
                  error={sourceError}
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
