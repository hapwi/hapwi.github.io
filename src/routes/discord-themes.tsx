import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ChevronLeft,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'

import { CodeFileViewer } from '@/components/code-file-viewer'
import {
  LibraryMetaHeader,
  LibraryMetaValues,
  formatFileSize,
} from '@/components/library/meta-columns'
import { Button } from '@/components/ui/button'
import { folderGroups } from '@/lib/library'

export const Route = createFileRoute('/discord-themes')({
  validateSearch: (search: Record<string, unknown>) => ({
    file: typeof search.file === 'string' ? search.file : undefined,
  }),
  component: DiscordThemesRoute,
})

const THEMES_FOLDER_ID = 'discord/themes'
const PRODUCTION_ORIGIN = 'https://hapwi.github.io'

const SOURCE_CACHE_PREFIX = 'discord-themes:raw-source:v1:'
const SOURCE_CACHE_MAX_ENTRIES = 25

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

function buildAbsoluteAssetUrl(relativePath: string) {
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

function DiscordThemesRoute() {
  const discordFolder =
    folderGroups.find((folder) => folder.id === 'discord') ?? null
  const themeSubfolder =
    discordFolder?.subfolders.find((sub) => sub.id === THEMES_FOLDER_ID) ?? null
  const themeAssets = themeSubfolder?.items ?? []

  const { file } = Route.useSearch()

  const selectedAssetPath =
    file && themeAssets.some((asset) => asset.urlPath === file) ? file : null

  const activeAsset = selectedAssetPath
    ? themeAssets.find((asset) => asset.urlPath === selectedAssetPath) ?? null
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
      if (!hasCachedSource) {
        setIsLoadingSource(true)
        setSourceError(null)
      }

      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const text = await response.text()
        if (!cancelled) {
          setAssetSource(text)
          writeCachedSource(resolvedAssetUrl, text)
        }
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        console.error('Failed to load asset source:', err)
        if (!hasCachedSource) {
          setAssetSource(null)
          setSourceError('Unable to load a highlighted preview for this file.')
        }
      } finally {
        if (!cancelled) {
          if (!hasCachedSource) setIsLoadingSource(false)
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

    const normalizedLabel = activeAsset.language.toLowerCase().replace(/\s+/g, '-')
    const extension = activeAsset.extension.toLowerCase()

    if (normalizedLabel && normalizedLabel !== 'file') {
      return normalizedLabel
    }

    if (extension) {
      return extension
    }

    return 'txt'
  }, [activeAsset])

  const languageLabel = activeAsset?.language ?? 'FILE'

  const absoluteAssetUrl = useMemo(() => {
    if (!activeAsset) return null
    return buildAbsoluteAssetUrl(activeAsset.urlPath)
  }, [activeAsset])

  const handleCopyUrl = async () => {
    if (!absoluteAssetUrl) return
    try {
      await navigator.clipboard.writeText(absoluteAssetUrl)
      toast.success('URL copied to clipboard')
    } catch (err) {
      console.error('Failed to copy URL:', err)
      toast.error('Failed to copy URL')
    }
  }

  const canCopyRaw = Boolean(assetSource) && !sourceError

  const handleCopyRaw = async () => {
    if (!assetSource) return
    try {
      await navigator.clipboard.writeText(assetSource)
      toast.success('Raw source copied to clipboard')
    } catch (err) {
      console.error('Failed to copy raw source:', err)
      toast.error('Failed to copy raw source')
    }
  }

  // Show file list view when no file is selected
  if (!selectedAssetPath) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="space-y-6">
            {/* File browser */}
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              {/* Header bar */}
              <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{themeAssets.length} theme files</span>
                </div>
                <LibraryMetaHeader />
              </div>

              {/* File list */}
              <div className="divide-y divide-border/50">
                {themeAssets.map((item, index) => (
                  <Link
                    key={item.urlPath}
                    to="/discord-themes"
                    search={{ file: item.urlPath }}
                    className="group w-full flex items-center gap-4 px-4 py-3 transition-all hover:bg-muted/50 text-left"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-purple-500/10 to-pink-500/5 ring-1 ring-purple-500/20">
                      <FileCode2 className="size-4 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                          {item.displayName}
                        </span>
                        <span className="hidden sm:inline-flex shrink-0 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
                          CSS
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <LibraryMetaValues mtime={item.mtime} size={item.size} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Info cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <div className="size-1.5 rounded-full bg-purple-500" />
                  How to use
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Click on any theme to view its source code. Copy the URL and paste it into your Discord client mod's custom CSS settings.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <div className="size-1.5 rounded-full bg-pink-500" />
                  Compatibility
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  These themes work with BetterDiscord, Vencord, Equicord, and other CSS-injection based Discord mods.
                </p>
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
          <div className="flex shrink-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link to="/discord-themes" search={{ file: undefined }}>
                  <ChevronLeft className="size-4" />
                  <span>Themes</span>
                </Link>
              </Button>
              <span className="text-muted-foreground/50">/</span>
              <span className="text-sm font-medium truncate">
                {activeAsset?.displayName}
              </span>
            </div>
            {activeAsset?.description ? (
              <p className="pl-1 text-sm text-muted-foreground line-clamp-2">
                {activeAsset.description}
              </p>
            ) : null}
          </div>

          {/* File viewer card */}
          <div className="flex min-h-0 max-h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* File header */}
            <div className="flex shrink-0 flex-col gap-3 border-b bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-purple-500/10 to-pink-500/5 ring-1 ring-purple-500/20">
                  <FileCode2 className="size-4 text-purple-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{activeAsset?.displayName}</span>
                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
                      CSS
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {activeAsset && formatFileSize(activeAsset.size)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Copy className="size-3.5" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRaw}
                  disabled={!canCopyRaw}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Copy className="size-3.5" />
                  <span className="hidden sm:inline">Copy Raw</span>
                  <span className="sm:hidden">Raw</span>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  <a href={activeAsset?.urlPath} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-3.5" />
                    Raw
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  <a href={activeAsset?.urlPath} download>
                    <Download className="size-3.5" />
                    <span className="hidden sm:inline">Download</span>
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
