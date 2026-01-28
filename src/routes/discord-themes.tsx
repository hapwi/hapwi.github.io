import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Copy,
  Download,
  Code,
  FileText,
  Link2,
  ArrowLeft,
  Palette,
} from 'lucide-react'
import { toast } from 'sonner'

import { CodeFileViewer } from '@/components/code-file-viewer'
import { FileIcon } from '@/components/file-icon'
import {
  PageLayout,
  PageHeader,
  PageContent,
  PageGrid,
  PageMain,
  PageSidebar,
  PageTitle,
  SidebarCard,
  SidebarCardHeader,
  FileListCard,
} from '@/components/page-layout'
import { RepoBreadcrumb } from '@/components/repo-breadcrumb'
import { formatFileSize } from '@/components/library/meta-columns'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
      toast.success('Raw URL copied to clipboard')
    } catch (err) {
      console.error('Failed to copy URL:', err)
      toast.error('Failed to copy raw URL')
    }
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

  const latestMtime = themeAssets.reduce(
    (max, item) => Math.max(max, item.mtime ?? 0),
    0
  )

  // Show file list view when no file is selected
  if (!selectedAssetPath) {
    return (
      <PageLayout>
        <PageContent>
          <PageHeader>
            <RepoBreadcrumb segments={[{ label: 'themes' }]} />
            <PageTitle
              icon={<Palette className="size-5 sm:size-6" />}
              iconClassName="bg-primary/10 text-primary"
              title="Discord Themes"
              description="Custom CSS themes for BetterDiscord, Vencord, and Equicord"
            />
          </PageHeader>

          <PageGrid>
            <PageMain>
              <FileListCard
                header={
                  <>
                    <span className="text-sm font-medium">
                      {themeAssets.length} theme{themeAssets.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Updated {formatRelativeTime(latestMtime)}
                    </span>
                  </>
                }
              >
                {themeAssets.map((item) => (
                  <Link
                    key={item.urlPath}
                    to="/discord-themes"
                    search={{ file: item.urlPath }}
                    className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-3.5 transition-colors hover:bg-muted/50"
                  >
                    <FileIcon filename={item.name} extension={item.extension} size="sm" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate block text-sm sm:text-base">
                        {item.name}
                      </span>
                      {item.description && (
                        <p className="mt-0.5 truncate text-xs sm:text-sm text-muted-foreground hidden sm:block">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground hidden xs:block">
                      {formatRelativeTime(item.mtime)}
                    </span>
                  </Link>
                ))}
              </FileListCard>
            </PageMain>

            <PageSidebar>
              <SidebarCard>
                <SidebarCardHeader icon={<FileText className="size-4" />} title="About" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Custom CSS themes for Discord clients. Compatible with BetterDiscord, Vencord, and Equicord.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-purple-500/20 bg-purple-500/5 px-2.5 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
                    CSS
                  </span>
                  <span className="rounded-full border border-blue-500/20 bg-blue-500/5 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                    themes
                  </span>
                </div>
              </SidebarCard>

              <SidebarCard>
                <SidebarCardHeader icon={<Code className="size-4" />} title="How to use" />
                <ol className="text-sm leading-relaxed text-muted-foreground space-y-2">
                  <li className="flex gap-2">
                    <span className="font-mono text-xs text-primary">1.</span>
                    Click on any theme to view source
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-xs text-primary">2.</span>
                    Copy the raw URL
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-xs text-primary">3.</span>
                    Paste into your client's CSS settings
                  </li>
                </ol>
              </SidebarCard>
            </PageSidebar>
          </PageGrid>
        </PageContent>
      </PageLayout>
    )
  }

  // Show file viewer when a file is selected
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex min-h-0 flex-1 flex-col gap-4 sm:gap-5">
          {/* Header */}
          <header className="flex items-center gap-3 sm:gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
            >
              <Link to="/discord-themes" search={{ file: undefined }}>
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            <div className="h-5 w-px bg-border shrink-0" />
            <div className="min-w-0 flex-1">
              <RepoBreadcrumb
                segments={[
                  { label: 'themes', href: '/discord-themes', search: { file: undefined } },
                  { label: activeAsset?.name || '', isFile: true, filename: activeAsset?.name },
                ]}
              />
            </div>
          </header>

          {/* File viewer card */}
          <div className="flex min-h-0 max-h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
            {/* File header */}
            <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-3 sm:px-5 py-2.5 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <FileIcon filename={activeAsset?.name || ''} extension={activeAsset?.extension} size="sm" />
                <div className="min-w-0">
                  <span className="font-medium truncate block text-sm sm:text-base">{activeAsset?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {assetSource ? `${assetSource.split('\n').length} lines` : ''}
                    {activeAsset && ` · ${formatFileSize(activeAsset.size)}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyRaw}
                        disabled={!canCopyRaw}
                        className="h-8 gap-1.5 text-xs px-2 sm:px-3"
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
                      className="h-8 gap-1.5 text-xs px-2 sm:px-3"
                      aria-label="Copy raw file URL"
                    >
                      <Link2 className="size-3.5" />
                      <span className="hidden sm:inline">URL</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Copy raw URL for CSS import
                  </TooltipContent>
                </Tooltip>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
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
