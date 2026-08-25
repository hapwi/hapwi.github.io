import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeft,
  Copy,
  Download,
  ExternalLink,
  Folder,
  GitBranch,
  Link2,
} from 'lucide-react'
import { toast } from 'sonner'

import { CodeFileViewer } from '@/components/code-file-viewer'
import { FileIcon } from '@/components/file-icon'
import { RepoBreadcrumb } from '@/components/repo-breadcrumb'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { findCuratedProject } from '@/data/projects'
import { formatFileSize } from '@/lib/format'
import {
  buildGitHubBlobUrl,
  buildRawGitHubUrl,
  GITHUB_OWNER,
} from '@/lib/github'
import {
  buildRepoListing,
  canPreviewFile,
  loadRepoTree,
  previewDisabledReason,
  readCachedFileSource,
  readCachedTree,
  writeCachedFileSource,
  type RepoFile,
} from '@/lib/github-browser'
import { highlightLanguageFromExtension } from '@/lib/languages'

type GitHubRepoBrowserProps = {
  repo: string
  file?: string
  path?: string
}

export function GitHubRepoBrowser({
  repo,
  file,
  path,
}: GitHubRepoBrowserProps) {
  const owner = GITHUB_OWNER
  const curated = findCuratedProject(repo)
  const title = curated?.name ?? repo
  const description =
    curated?.description ?? `Live tree of ${owner}/${repo} fetched from GitHub.`

  const cachedTree = readCachedTree(owner, repo)
  const [branch, setBranch] = useState(cachedTree?.branch ?? 'main')
  const [files, setFiles] = useState<RepoFile[]>(cachedTree?.files ?? [])
  const [isLoadingTree, setIsLoadingTree] = useState(!cachedTree)
  const [treeError, setTreeError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function loadTree() {
      setIsLoadingTree(true)
      setTreeError(null)

      try {
        const tree = await loadRepoTree({
          owner,
          repo,
          signal: controller.signal,
        })
        if (cancelled) return
        setBranch(tree.branch)
        setFiles(tree.files)
      } catch (err) {
        if (cancelled) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        setTreeError(
          err instanceof Error ? err.message : 'Failed to load repo files',
        )
      } finally {
        if (!cancelled) setIsLoadingTree(false)
      }
    }

    void loadTree()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [owner, repo])

  const selectedPath =
    file && files.some((candidate) => candidate.path === file) ? file : null

  const activeFile = selectedPath
    ? (files.find((candidate) => candidate.path === selectedPath) ?? null)
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

  const listing = useMemo(
    () => buildRepoListing(files, currentPath),
    [files, currentPath],
  )

  const rawUrl = useMemo(() => {
    if (!activeFile) return null
    return buildRawGitHubUrl({
      owner,
      repo,
      ref: branch,
      filePath: activeFile.path,
    })
  }, [activeFile, branch, owner, repo])

  const blobUrl = useMemo(() => {
    if (!activeFile) return null
    return buildGitHubBlobUrl({
      owner,
      repo,
      ref: branch,
      filePath: activeFile.path,
    })
  }, [activeFile, branch, owner, repo])

  const previewable = Boolean(activeFile) && canPreviewFile(activeFile!)

  const [fileSource, setFileSource] = useState<string | null>(() => {
    if (typeof window === 'undefined' || !rawUrl) return null
    return readCachedFileSource(owner, repo, rawUrl)?.text ?? null
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

    if (!previewable) {
      setFileSource(null)
      setSourceError(previewDisabledReason(activeFile))
      setIsLoadingSource(false)
      return
    }

    const cached = readCachedFileSource(owner, repo, resolvedRawUrl)
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
          writeCachedFileSource(owner, repo, resolvedRawUrl, text)
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (!hasCachedSource) {
          setFileSource(null)
          setSourceError(
            err instanceof Error ? err.message : 'Failed to load file contents',
          )
        }
      } finally {
        if (!cancelled) setIsLoadingSource(false)
      }
    }

    void fetchSource()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [activeFile, rawUrl, previewable, owner, repo])

  const highlightLanguage = highlightLanguageFromExtension(
    activeFile?.extension,
  )
  const languageLabel = activeFile?.extension
    ? activeFile.extension.toUpperCase()
    : 'FILE'

  const handleCopyUrl = async () => {
    if (!rawUrl) return
    try {
      await navigator.clipboard.writeText(rawUrl)
      toast.success('Raw URL copied to clipboard')
    } catch {
      toast.error('Failed to copy raw URL')
    }
  }

  const handleCopyRaw = async () => {
    if (!fileSource) return
    try {
      await navigator.clipboard.writeText(fileSource)
      toast.success('Code copied to clipboard')
    } catch {
      toast.error('Failed to copy code')
    }
  }

  const githubRepoUrl = `https://github.com/${owner}/${repo}`

  const breadcrumbSegments = useMemo(() => {
    const segments: Array<{
      label: string
      href?: string
      params?: Record<string, string>
      search?: Record<string, unknown>
      isFile?: boolean
      filename?: string
    }> = [
      {
        label: 'repos',
        href: '/repos',
      },
      {
        label: repo,
        href: '/repos/$repo',
        params: { repo },
        search: { file: undefined, path: undefined },
      },
    ]

    const folderParts = currentPath
      ? currentPath.split('/').filter(Boolean)
      : []
    let runningPath = ''
    for (const part of folderParts) {
      runningPath = runningPath ? `${runningPath}/${part}` : part
      segments.push({
        label: part,
        href: '/repos/$repo',
        params: { repo },
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
  }, [currentPath, activeFile, repo])

  if (!selectedPath) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-4">
              <RepoBreadcrumb segments={breadcrumbSegments} />
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {title}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                    <GitBranch className="size-3.5" />
                    {branch}
                  </span>
                </div>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  {description}
                </p>
              </div>
            </header>

            <div className="grid gap-8 lg:grid-cols-[1fr_260px] lg:gap-10">
              <section className="min-w-0">
                <div className="overflow-hidden rounded-md border bg-card">
                  <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5 sm:px-5">
                    <span className="font-mono text-xs text-muted-foreground">
                      {owner}/{repo}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {isLoadingTree
                        ? 'Loading…'
                        : `${listing.folders.length + listing.files.length} items`}
                    </span>
                  </div>

                  {treeError ? (
                    <Alert variant="destructive" className="m-4">
                      <AlertCircle />
                      <AlertTitle>Could not load this repository</AlertTitle>
                      <AlertDescription>{treeError}</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {listing.folders.map((folder) => (
                        <Link
                          key={folder.path}
                          to="/repos/$repo"
                          params={{ repo }}
                          search={{ file: undefined, path: folder.path }}
                          className="catalog-row group"
                        >
                          <span className="catalog-caret" aria-hidden />
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Folder className="size-4" />
                          </div>
                          <span className="flex-1 font-medium group-hover:text-primary">
                            {folder.name}
                          </span>
                          <span className="shrink-0 font-mono text-xs text-muted-foreground">
                            /
                          </span>
                        </Link>
                      ))}
                      {listing.files.map((item) => (
                        <Link
                          key={item.path}
                          to="/repos/$repo"
                          params={{ repo }}
                          search={{ file: item.path, path: undefined }}
                          className="catalog-row group"
                        >
                          <span className="catalog-caret" aria-hidden />
                          <FileIcon
                            filename={item.name}
                            extension={item.extension}
                            size="sm"
                          />
                          <span className="min-w-0 flex-1 truncate font-medium group-hover:text-primary">
                            {item.name}
                          </span>
                          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                            {item.size != null ? formatFileSize(item.size) : ''}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <aside className="flex flex-col gap-4">
                <div className="rounded-md border bg-card p-4">
                  <h2 className="font-mono text-xs text-muted-foreground">
                    github
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Files are fetched from GitHub and cached in this browser.
                    Unauthenticated API access is rate-limited.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <a href={githubRepoUrl} target="_blank" rel="noreferrer">
                      <ExternalLink data-icon="inline-start" />
                      Open repository
                    </a>
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <header className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Link
                to="/repos/$repo"
                params={{ repo }}
                search={{ file: undefined, path: currentPath || undefined }}
              >
                <ArrowLeft />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            <div className="h-5 w-px bg-border" />
            <RepoBreadcrumb segments={breadcrumbSegments} />
          </header>

          <div className="flex min-h-0 max-h-full flex-col overflow-hidden rounded-md border bg-card">
            <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-3 py-2.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <FileIcon
                  filename={activeFile?.name || ''}
                  extension={activeFile?.extension}
                  size="sm"
                />
                <div className="min-w-0">
                  <span className="block truncate font-medium">
                    {activeFile?.name}
                  </span>
                  <span className="block truncate font-mono text-xs text-muted-foreground">
                    {activeFile?.path}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <span className="hidden font-mono text-xs tabular-nums text-muted-foreground sm:inline">
                  {activeFile?.size != null
                    ? formatFileSize(activeFile.size)
                    : ''}
                </span>
                <div className="mx-1 hidden h-4 w-px bg-border sm:block" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyRaw}
                        disabled={!fileSource}
                        className="h-8 text-xs"
                        aria-label="Copy file contents"
                      >
                        <Copy />
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
                      className="h-8 text-xs"
                      aria-label="Copy raw file URL"
                    >
                      <Link2 />
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
                      className="h-8 text-xs"
                      asChild
                    >
                      <a
                        href={blobUrl ?? githubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open file on GitHub"
                      >
                        <ExternalLink />
                        <span className="hidden sm:inline">GitHub</span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    View on GitHub
                  </TooltipContent>
                </Tooltip>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  asChild
                >
                  <a
                    href={rawUrl ?? undefined}
                    download
                    aria-label="Download file"
                  >
                    <Download />
                  </a>
                </Button>
              </div>
            </div>

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
