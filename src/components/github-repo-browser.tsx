import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Copy,
  Download,
  ExternalLink,
  Folder,
  GitBranch,
  Github,
  Link2,
} from 'lucide-react'
import { toast } from 'sonner'

import { InstallCommand } from '@/components/catalog-row'
import { CodeFileViewer } from '@/components/code-file-viewer'
import { FileIcon } from '@/components/file-icon'
import { ProjectEmblem } from '@/components/project-emblem'
import { ProjectMeta } from '@/components/project-ledger'
import { ProjectReadme } from '@/components/project-readme'
import { RepoBreadcrumb } from '@/components/repo-breadcrumb'
import { SiteFooter } from '@/components/site-footer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { findCuratedProject } from '@/data/projects'
import { useCatalog } from '@/hooks/use-catalog'
import { formatFileSize, formatRelativeTime } from '@/lib/format'
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
  source?: boolean
}

export function GitHubRepoBrowser({
  repo,
  file,
  path,
  source,
}: GitHubRepoBrowserProps) {
  const owner = GITHUB_OWNER
  const curated = findCuratedProject(repo)
  const { projects } = useCatalog()
  const project =
    projects.find(
      (candidate) => candidate.repo === repo || candidate.githubName === repo,
    ) ?? curated
  const title = project?.name ?? repo
  const description =
    project?.description ?? `Live tree of ${owner}/${repo} fetched from GitHub.`

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
  const readmeFile = useMemo(
    () =>
      files.find(
        (candidate) =>
          !candidate.path.includes('/') &&
          /^readme(?:\.(?:md|mdx|markdown))?$/i.test(candidate.name),
      ) ?? null,
    [files],
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
        search: {
          file: undefined,
          path: undefined,
          source: source ? true : undefined,
        },
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
        search: { file: undefined, path: runningPath, source: true },
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
  }, [currentPath, activeFile, repo, source])

  if (!source && !selectedPath) {
    const details: Array<{ label: string; value: string }> = []
    if (project?.language) {
      details.push({ label: 'Language', value: project.language })
    }
    if (typeof project?.stars === 'number') {
      details.push({ label: 'Stars', value: String(project.stars) })
    }
    if (project?.updatedAt) {
      details.push({
        label: 'Updated',
        value: formatRelativeTime(project.updatedAt),
      })
    }
    details.push({ label: 'Branch', value: branch })
    if (!isLoadingTree && !treeError) {
      details.push({ label: 'Files', value: String(files.length) })
    }

    const browseLink = (
      <Link
        to="/repos/$repo"
        params={{ repo }}
        search={{ file: undefined, path: undefined, source: true }}
      >
        <Folder data-icon="inline-start" />
        Browse files
      </Link>
    )

    return (
      <>
        <main className="site-container flex-1 py-6 sm:py-8">
          <nav aria-label="Breadcrumb" className="mb-5">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="-ml-2 text-muted-foreground hover:text-foreground"
            >
              <Link to="/">
                <ArrowLeft data-icon="inline-start" />
                Work
              </Link>
            </Button>
          </nav>

          <header className="grid gap-5 border-b pb-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center lg:grid-cols-[auto_minmax(0,1fr)_auto]">
            <ProjectEmblem
              id={project?.id ?? repo}
              name={title}
              className="size-16 sm:size-20"
              size={160}
              loading="eager"
            />
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 max-w-[60ch] text-base leading-7 text-muted-foreground sm:text-lg">
                {description}
              </p>
              {project ? (
                <ProjectMeta
                  project={project}
                  className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1"
                />
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-1">
              <Button asChild>
                <a href={githubRepoUrl} target="_blank" rel="noreferrer">
                  <Github data-icon="inline-start" />
                  GitHub
                </a>
              </Button>
              <Button asChild variant="outline">
                {browseLink}
              </Button>
            </div>
          </header>

          <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
            <aside className="flex flex-col gap-6 lg:order-last lg:sticky lg:top-20 lg:self-start">
              {project?.installCommand ? (
                <section aria-labelledby="install-heading">
                  <h2 id="install-heading" className="text-sm font-medium">
                    Install
                  </h2>
                  <InstallCommand
                    command={project.installCommand}
                    className="mt-2"
                  />
                </section>
              ) : null}

              <section aria-labelledby="details-heading">
                <h2 id="details-heading" className="text-sm font-medium">
                  Details
                </h2>
                <dl className="mt-2 divide-y rounded-lg border text-sm">
                  {details.map((detail) => (
                    <div
                      key={detail.label}
                      className="flex items-center justify-between gap-4 px-3 py-2"
                    >
                      <dt className="text-muted-foreground">{detail.label}</dt>
                      <dd className="truncate font-mono text-[0.8125rem] tabular-nums">
                        {detail.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section aria-labelledby="links-heading">
                <h2 id="links-heading" className="text-sm font-medium">
                  Links
                </h2>
                <ul className="mt-2 flex flex-col gap-1 text-sm">
                  <li>
                    <a
                      href={githubRepoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                      {owner}/{repo}
                    </a>
                  </li>
                  <li>
                    <Link
                      to="/repos/$repo"
                      params={{ repo }}
                      search={{
                        file: undefined,
                        path: undefined,
                        source: true,
                      }}
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Folder className="size-3.5" aria-hidden="true" />
                      Browse files
                    </Link>
                  </li>
                </ul>
              </section>
            </aside>

            <section className="min-w-0" aria-label="README">
              {treeError ? (
                <Alert>
                  <AlertTitle>Project details unavailable</AlertTitle>
                  <AlertDescription>{treeError}</AlertDescription>
                </Alert>
              ) : isLoadingTree ? (
                <div
                  className="flex flex-col gap-4 py-2"
                  aria-label="Loading project details"
                >
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : readmeFile ? (
                <ProjectReadme
                  owner={owner}
                  repo={repo}
                  branch={branch}
                  path={readmeFile.path}
                  title={title}
                />
              ) : (
                <Alert>
                  <AlertTitle>No README in this repository</AlertTitle>
                  <AlertDescription>
                    Browse the files here or open the project on GitHub.
                  </AlertDescription>
                </Alert>
              )}
            </section>
          </div>
        </main>
        <SiteFooter />
      </>
    )
  }

  if (!selectedPath) {
    return (
      <>
        <main className="site-container flex-1 py-6 sm:py-8">
          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <RepoBreadcrumb segments={breadcrumbSegments} />
                <Button asChild variant="outline" size="sm">
                  <Link
                    to="/repos/$repo"
                    params={{ repo }}
                    search={{
                      file: undefined,
                      path: undefined,
                      source: undefined,
                    }}
                  >
                    <BookOpen data-icon="inline-start" />
                    Project overview
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                  {title}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  <GitBranch className="size-3.5" aria-hidden="true" />
                  {branch}
                </span>
              </div>
            </header>

            <section className="min-w-0 overflow-hidden rounded-xl border bg-card">
              <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5 sm:px-5">
                <span className="font-mono text-xs text-muted-foreground">
                  {owner}/{repo}
                  {currentPath ? `/${currentPath}` : ''}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
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
              ) : isLoadingTree ? (
                <div
                  className="flex flex-col gap-3 p-4"
                  aria-label="Loading files"
                >
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {listing.folders.map((folder) => (
                    <Link
                      key={folder.path}
                      to="/repos/$repo"
                      params={{ repo }}
                      search={{
                        file: undefined,
                        path: folder.path,
                        source: true,
                      }}
                      className="catalog-row group text-sm"
                    >
                      <span className="catalog-caret" aria-hidden />
                      <Folder
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="flex-1 font-medium">{folder.name}</span>
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
                      search={{
                        file: item.path,
                        path: undefined,
                        source: true,
                      }}
                      className="catalog-row group text-sm"
                    >
                      <span className="catalog-caret" aria-hidden />
                      <FileIcon
                        filename={item.name}
                        extension={item.extension}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {item.name}
                      </span>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {item.size != null ? formatFileSize(item.size) : ''}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <p className="text-xs text-muted-foreground">
              Files are fetched from GitHub and cached in this browser.
              Unauthenticated API access is rate-limited.{' '}
              <a
                href={githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-3 hover:text-foreground"
              >
                Open on GitHub
              </a>
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <main className="site-container flex h-[calc(100dvh-3.5rem-3.75rem-env(safe-area-inset-bottom,0px))] min-h-[34rem] flex-col gap-4 py-5 md:h-[calc(100dvh-3.5rem)] sm:py-6">
      <header className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link
            to="/repos/$repo"
            params={{ repo }}
            search={{
              file: undefined,
              path: currentPath || undefined,
              source: true,
            }}
          >
            <ArrowLeft data-icon="inline-start" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </Button>
        <RepoBreadcrumb segments={breadcrumbSegments} />
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/40 px-3 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <FileIcon
              filename={activeFile?.name || ''}
              extension={activeFile?.extension}
              size="sm"
            />
            <div className="min-w-0">
              <span className="block truncate font-mono text-sm font-medium">
                {activeFile?.name}
              </span>
              <span className="block truncate font-mono text-xs text-muted-foreground">
                {activeFile?.path}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <span className="hidden font-mono text-xs tabular-nums text-muted-foreground sm:inline">
              {activeFile?.size != null ? formatFileSize(activeFile.size) : ''}
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

            <Button variant="ghost" size="icon-sm" asChild>
              <a href={rawUrl ?? undefined} download aria-label="Download file">
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
      </section>
    </main>
  )
}
