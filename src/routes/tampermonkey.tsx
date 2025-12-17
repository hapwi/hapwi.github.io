import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Copy,
  Download,
  GitBranch,
  Code,
  FileText,
  History,
  Link2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'

import { CodeFileViewer } from '@/components/code-file-viewer'
import { FileIcon } from '@/components/file-icon'
import { RepoBreadcrumb } from '@/components/repo-breadcrumb'
import { formatFileSize } from '@/components/library/meta-columns'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { folderGroups } from '@/lib/library'

export const Route = createFileRoute('/tampermonkey')({
  validateSearch: (search: Record<string, unknown>) => ({
    file: typeof search.file === 'string' ? search.file : undefined,
  }),
  component: TampermonkeyRoute,
})

const SCRIPTS_FOLDER_ID = 'tampermonkey/scripts'
const PRODUCTION_ORIGIN = 'https://hapwi.github.io'

const SOURCE_CACHE_PREFIX = 'tampermonkey:raw-source:v1:'
const SOURCE_CACHE_MAX_ENTRIES = 25

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hr ago`
  if (minutes > 0) return `${minutes} min ago`
  return 'just now'
}

type CachedSource = {
  text: string
  updatedAt: number
}

function readCachedSource(urlPath: string) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(`${SOURCE_CACHE_PREFIX}${urlPath}`)
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

function writeCachedSource(urlPath: string, text: string) {
  if (typeof window === 'undefined') return
  try {
    const key = `${SOURCE_CACHE_PREFIX}${urlPath}`
    const value: CachedSource = { text, updatedAt: Date.now() }
    window.localStorage.setItem(key, JSON.stringify(value))
    pruneSourceCache()
  } catch {
    // ignore storage quota / serialization issues
  }
}

function buildShareAssetUrl(relativePath: string) {
  const basePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  if (typeof window === 'undefined') {
    return new URL(basePath, PRODUCTION_ORIGIN).toString()
  }

  const currentOrigin = window.location.origin
  const shouldForceProduction =
    currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')

  const origin = shouldForceProduction ? PRODUCTION_ORIGIN : currentOrigin
  return new URL(basePath, origin).toString()
}

function buildFetchAssetUrl(relativePath: string) {
  const basePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  if (typeof window === 'undefined') {
    return new URL(basePath, PRODUCTION_ORIGIN).toString()
  }

  return new URL(basePath, window.location.origin).toString()
}

function TampermonkeyRoute() {
  const tmFolder =
    folderGroups.find((folder) => folder.id === 'tampermonkey') ?? null
  const scriptsSubfolder =
    tmFolder?.subfolders.find((sub) => sub.id === SCRIPTS_FOLDER_ID) ??
    tmFolder?.subfolders[0] ??
    null
  const scripts = scriptsSubfolder?.items ?? []

  const { file } = Route.useSearch()

  const selectedAssetPath =
    file && scripts.some((asset) => asset.urlPath === file) ? file : null

  const activeAsset = selectedAssetPath
    ? scripts.find((asset) => asset.urlPath === selectedAssetPath) ?? null
    : null

  const assetUrl = activeAsset?.urlPath ?? null

  const [assetSource, setAssetSource] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    if (!assetUrl) return null
    return readCachedSource(assetUrl)?.text ?? null
  })
  const [isLoadingSource, setIsLoadingSource] = useState(false)
  const [sourceError, setSourceError] = useState<string | null>(null)

  useEffect(() => {
    if (!assetUrl) {
      setAssetSource(null)
      setSourceError(null)
      return
    }

    const resolvedAssetUrl = assetUrl
    const cached = readCachedSource(resolvedAssetUrl)
    const hasCachedSource = Boolean(cached?.text)

    if (hasCachedSource) {
      setAssetSource(cached!.text)
      setSourceError(null)
    } else {
      setAssetSource(null)
    }

    let cancelled = false
    const controller = new AbortController()

    async function fetchSource(url: string) {
      setIsLoadingSource(true)
      setSourceError(null)

      try {
        const absoluteUrl = buildFetchAssetUrl(url)
        const response = await fetch(absoluteUrl, {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!response.ok) {
          throw new Error(`Failed to load script (${response.status})`)
        }

        const text = await response.text()
        if (!cancelled) {
          setAssetSource(text)
          writeCachedSource(resolvedAssetUrl, text)
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('Failed to fetch source:', err)
        setSourceError(
          err instanceof Error ? err.message : 'Failed to load script source',
        )
      } finally {
        if (!cancelled) {
          setIsLoadingSource(false)
        }
      }
    }

    fetchSource(resolvedAssetUrl)

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [assetUrl])

  const highlightLanguage = useMemo(() => {
    if (!activeAsset) return 'txt'
    const extension = activeAsset.extension.toLowerCase()
    if (extension === 'js') return 'javascript'
    return extension || 'txt'
  }, [activeAsset])

  const languageLabel = activeAsset?.language ?? 'FILE'

  const absoluteAssetUrl = useMemo(() => {
    if (!activeAsset) return null
    return buildShareAssetUrl(activeAsset.urlPath)
  }, [activeAsset])

  const handleCopyUrl = async () => {
    if (!absoluteAssetUrl) return
    try {
      await navigator.clipboard.writeText(absoluteAssetUrl)
      toast.success('Raw URL copied to clipboard')
    } catch (err) {
      console.error('Failed to copy URL:', err)
      toast.error('Failed to copy raw URL')
    }
  }

  const handleOpenUrl = () => {
    if (!absoluteAssetUrl) return
    window.open(absoluteAssetUrl, '_blank', 'noopener,noreferrer')
  }

  const canCopyRaw = Boolean(assetSource) && !sourceError

  const handleCopyRaw = async () => {
    if (!assetSource) return
    try {
      await navigator.clipboard.writeText(assetSource)
      toast.success('Code copied to clipboard')
    } catch (err) {
      console.error('Failed to copy raw source:', err)
      toast.error('Failed to copy code')
    }
  }

  const latestMtime = scripts.reduce(
    (max, item) => Math.max(max, item.mtime ?? 0),
    0
  )

  // Show file list view when no file is selected
  if (!selectedAssetPath) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="space-y-6">
            {/* Breadcrumb */}
            <RepoBreadcrumb
              segments={[
                { label: 'scripts' },
              ]}
            />

            {/* Main content */}
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              {/* File browser */}
              <div className="overflow-hidden rounded-lg border bg-card">
                {/* Branch bar */}
                <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-2.5">
                  <div className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-sm">
                    <GitBranch className="size-3.5 text-muted-foreground" />
                    <span className="font-medium">master</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {scripts.length} files
                  </span>
                </div>

                {/* File list */}
                <div className="divide-y divide-border/50">
                  {scripts.map((item) => (
                    <Link
                      key={item.urlPath}
                      to="/tampermonkey"
                      search={{ file: item.urlPath }}
                      className="group flex items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/40"
                    >
                      <FileIcon filename={item.name} extension={item.extension} size="sm" />
                      <span className="flex-1 truncate text-sm text-foreground group-hover:text-blue-500 group-hover:underline">
                        {item.name}
                      </span>
                      <span className="hidden text-sm text-muted-foreground sm:block truncate max-w-[40%]">
                        {item.description || ''}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {formatRelativeTime(item.mtime)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* About */}
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="size-4 text-muted-foreground" />
                    About
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Userscripts for Tampermonkey, Greasemonkey, and other script managers.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      JavaScript
                    </span>
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      userscripts
                    </span>
                  </div>
                </div>

                {/* How to use */}
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Code className="size-4 text-muted-foreground" />
                    How to use
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Install Tampermonkey, then click on a script to view it. Use Open URL to install directly, or Copy URL to paste it into your script manager.
                  </p>
                </div>

                {/* Security notice */}
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="size-4" />
                    Security
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Always review userscript code before installing. Scripts run with elevated permissions on web pages.
                  </p>
                </div>

                {/* Stats */}
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <History className="size-4 text-muted-foreground" />
                    Activity
                  </h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Files</span>
                      <span className="font-medium">{scripts.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last updated</span>
                      <span className="font-medium">{formatRelativeTime(latestMtime)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show file viewer when a file is selected
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Breadcrumb navigation */}
          <RepoBreadcrumb
            segments={[
              { label: 'scripts', href: '/tampermonkey', search: { file: undefined } },
              { label: activeAsset?.name || '', isFile: true, filename: activeAsset?.name },
            ]}
          />

          {/* File viewer card */}
          <div className="flex min-h-0 max-h-full flex-col overflow-hidden rounded-lg border bg-card">
            {/* File header */}
            <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-4 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <FileIcon filename={activeAsset?.name || ''} extension={activeAsset?.extension} size="sm" />
                <span className="text-sm font-medium truncate">{activeAsset?.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums">
                  {assetSource ? `${assetSource.split('\n').length} lines` : ''}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {activeAsset && formatFileSize(activeAsset.size)}
                </span>
                <div className="hidden sm:block h-4 w-px bg-border mx-1" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyRaw}
                        disabled={!canCopyRaw}
                        className="h-7 gap-1.5 text-xs"
                        aria-label="Copy file contents"
                      >
                        <Copy className="size-3" />
                        Copy code
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Copies the file contents to your clipboard
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyUrl}
                      className="h-7 gap-1.5 text-xs"
                      aria-label="Copy raw file URL"
                    >
                      <Link2 className="size-3" />
                      Copy URL
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Copies the direct raw URL to your clipboard
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleOpenUrl}
                      className="h-7 gap-1.5 text-xs"
                      aria-label="Open raw file URL"
                    >
                      <ExternalLink className="size-3" />
                      Open URL
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Opens the direct raw URL in a new tab for install
                  </TooltipContent>
                </Tooltip>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                >
                  <a href={activeAsset?.urlPath} download>
                    <Download className="size-3" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Code viewer */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {activeAsset ? (
                <CodeFileViewer
                  fileName={activeAsset.displayName}
                  languageLabel={languageLabel}
                  highlightLanguage={highlightLanguage}
                  source={assetSource}
                  sourceUrl={absoluteAssetUrl}
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
