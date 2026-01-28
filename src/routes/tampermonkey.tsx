import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Copy,
  Download,
  Code,
  FileText,
  Link2,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  Terminal,
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

  if (years > 0) return `${years}y ago`
  if (months > 0) return `${months}mo ago`
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'now'
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
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <header className="space-y-4">
              <RepoBreadcrumb
                segments={[
                  { label: 'scripts' },
                ]}
              />
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Terminal className="size-6" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    Browser Userscripts
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    Scripts for Tampermonkey, Greasemonkey, and other managers
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
                    <span className="text-sm font-medium">
                      {scripts.length} script{scripts.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Updated {formatRelativeTime(latestMtime)}
                    </span>
                  </div>

                  {/* File list */}
                  <div className="divide-y divide-border/50 editorial-stagger">
                    {scripts.map((item) => (
                      <Link
                        key={item.urlPath}
                        to="/tampermonkey"
                        search={{ file: item.urlPath }}
                        className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50"
                      >
                        <FileIcon filename={item.name} extension={item.extension} size="sm" />
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {item.name}
                          </span>
                          {item.description && (
                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {formatRelativeTime(item.mtime)}
                        </span>
                      </Link>
                    ))}
                  </div>
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
                    Userscripts for Tampermonkey, Greasemonkey, and other browser script managers.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                      JavaScript
                    </span>
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/5 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                      userscripts
                    </span>
                  </div>
                </div>

                {/* How to use */}
                <div className="rounded-lg border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="size-4 text-muted-foreground" />
                    <h3 className="font-display text-sm font-semibold">How to use</h3>
                  </div>
                  <ol className="text-sm leading-relaxed text-muted-foreground space-y-2">
                    <li className="flex gap-2">
                      <span className="font-mono text-xs text-amber-600 dark:text-amber-400">1.</span>
                      Install Tampermonkey extension
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono text-xs text-amber-600 dark:text-amber-400">2.</span>
                      Click on a script to view it
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono text-xs text-amber-600 dark:text-amber-400">3.</span>
                      Use Open URL to install directly
                    </li>
                  </ol>
                </div>

                {/* Security notice */}
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-display text-sm font-semibold text-amber-600 dark:text-amber-400">Security Notice</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Always review userscript code before installing. Scripts run with elevated permissions on web pages.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show file viewer when a file is selected
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
                <Link to="/tampermonkey" search={{ file: undefined }}>
                  <ArrowLeft className="size-4" />
                  <span className="hidden sm:inline">Back</span>
                </Link>
              </Button>
              <div className="h-5 w-px bg-border" />
              <RepoBreadcrumb
                segments={[
                  { label: 'scripts', href: '/tampermonkey', search: { file: undefined } },
                  { label: activeAsset?.name || '', isFile: true, filename: activeAsset?.name },
                ]}
              />
            </div>
          </header>

          {/* File viewer card */}
          <div className="flex min-h-0 max-h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
            {/* File header */}
            <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-5 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileIcon filename={activeAsset?.name || ''} extension={activeAsset?.extension} size="sm" />
                <div className="min-w-0">
                  <span className="font-medium truncate block">{activeAsset?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {assetSource ? `${assetSource.split('\n').length} lines` : ''}
                    {activeAsset && ` · ${formatFileSize(activeAsset.size)}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyRaw}
                        disabled={!canCopyRaw}
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
                      onClick={handleOpenUrl}
                      className="h-8 gap-1.5 text-xs"
                      aria-label="Open raw file URL"
                    >
                      <ExternalLink className="size-3.5" />
                      <span className="hidden sm:inline">Install</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Open URL to install in Tampermonkey
                  </TooltipContent>
                </Tooltip>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  <a href={activeAsset?.urlPath} download aria-label="Download file">
                    <Download className="size-3.5" />
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
