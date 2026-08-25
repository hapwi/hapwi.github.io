import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Copy, Download, Code, Link2 } from 'lucide-react'
import { toast } from 'sonner'

import { CodeFileViewer } from '@/components/code-file-viewer'
import { CollectionDetailShell } from '@/components/collection-detail-shell'
import { FileIcon } from '@/components/file-icon'
import {
  PageLayout,
  PageHero,
  PageContent,
  PageMain,
} from '@/components/page-layout'
import { formatFileSize } from '@/components/library/meta-columns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  buildHostedAssetUrl,
  getCollectionDetailLocation,
} from '@/lib/collection-links'
import { folderGroups } from '@/lib/library'

export const Route = createFileRoute('/discord-themes')({
  validateSearch: (search: Record<string, unknown>) => ({
    file: typeof search.file === 'string' ? search.file : undefined,
  }),
  component: DiscordThemesRoute,
})

const THEMES_FOLDER_ID = 'discord/themes'

const SOURCE_CACHE_PREFIX = 'discord-themes:raw-source:v1:'
const SOURCE_CACHE_MAX_ENTRIES = 25

function getThemePresentation(name: string) {
  const normalized = name.toLowerCase()

  if (normalized.includes('puccin')) {
    return {
      label: 'Catppuccin',
      palette: ['#1e1e2e', '#313244', '#cba6f7', '#89b4fa'],
    }
  }

  if (normalized.includes('charcoal')) {
    return {
      label: 'Charcoal',
      palette: ['#17191c', '#25282d', '#8e949e', '#d7dae0'],
    }
  }

  return {
    label: 'Equicord',
    palette: ['#17192b', '#25284a', '#8b7cf6', '#67d4d0'],
  }
}

function ThemePreview({ name }: { name: string }) {
  const { palette } = getThemePresentation(name)

  return (
    <div
      className="grid h-28 grid-cols-[3.5rem_1fr] overflow-hidden rounded-xl border"
      style={{ backgroundColor: palette[0] }}
      aria-hidden="true"
    >
      <div
        className="flex flex-col items-center gap-2 py-3"
        style={{ backgroundColor: palette[1] }}
      >
        <span
          className="size-7 rounded-full"
          style={{ backgroundColor: palette[2] }}
        />
        <span
          className="size-7 rounded-full opacity-60"
          style={{ backgroundColor: palette[3] }}
        />
      </div>
      <div className="flex flex-col justify-end gap-2 p-4">
        <span
          className="h-3 w-2/3 rounded-full opacity-90"
          style={{ backgroundColor: palette[2] }}
        />
        <span
          className="h-3 w-5/6 rounded-full opacity-55"
          style={{ backgroundColor: palette[3] }}
        />
        <span
          className="mt-1 h-8 rounded-lg opacity-35"
          style={{ backgroundColor: palette[1] }}
        />
      </div>
    </div>
  )
}

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
    ? (themeAssets.find((asset) => asset.urlPath === selectedAssetPath) ?? null)
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

    void fetchSource(resolvedAssetUrl)

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [assetUrl])

  const highlightLanguage = useMemo(() => {
    if (!activeAsset) return 'txt'

    const normalizedLabel = activeAsset.language
      .toLowerCase()
      .replace(/\s+/g, '-')
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
    return buildHostedAssetUrl(
      activeAsset.urlPath,
      typeof window === 'undefined' ? undefined : window.location.origin,
    )
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

  // Show file list view when no file is selected
  if (!selectedAssetPath) {
    return (
      <PageLayout>
        <PageContent>
          <PageHero
            label="Hosted CSS collection"
            title="Discord themes"
            description="Curated themes for Vencord, Equicord, and BetterDiscord—ready to preview, inspect, and use from a stable hosted URL."
          />

          <PageMain>
            <div>
              <h2 className="text-xl font-semibold">Hosted themes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Preview a theme, inspect its CSS, or copy its hosted URL.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {themeAssets.map((item) => (
                <Card key={item.urlPath} className="gap-0 overflow-hidden py-0">
                  <div className="bg-muted/40 p-3">
                    <ThemePreview name={item.name} />
                  </div>
                  <CardHeader className="gap-2 px-5 pt-5 pb-4">
                    <CardTitle className="text-lg">
                      {getThemePresentation(item.name).label}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 leading-relaxed">
                      {item.description ??
                        'Hosted custom CSS for Vencord-family Discord clients.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 px-5 pb-4">
                    <Badge variant="secondary">Vencord</Badge>
                    <Badge variant="secondary">Equicord</Badge>
                    <span className="ml-auto self-center text-xs text-muted-foreground">
                      Updated {formatRelativeTime(item.mtime)}
                    </span>
                  </CardContent>
                  <CardFooter className="mt-auto flex-wrap justify-end gap-2 border-t px-5 py-4">
                    <Button asChild size="sm">
                      <Link
                        {...getCollectionDetailLocation('themes', item.urlPath)}
                      >
                        View CSS
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            buildHostedAssetUrl(
                              item.urlPath,
                              window.location.origin,
                            ),
                          )
                          toast.success('Raw theme URL copied')
                        } catch {
                          toast.error('Failed to copy raw theme URL')
                        }
                      }}
                    >
                      <Link2 data-icon="inline-start" />
                      Copy URL
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </PageMain>

          <Alert className="max-w-3xl">
            <Code />
            <AlertTitle>Use a hosted theme</AlertTitle>
            <AlertDescription>
              Open a theme to review its CSS, then copy the raw URL into your
              Discord client&apos;s custom theme settings.
            </AlertDescription>
          </Alert>
        </PageContent>
      </PageLayout>
    )
  }

  return (
    <CollectionDetailShell
      backTo="/discord-themes"
      collectionLabel="Themes"
      fileName={activeAsset?.name ?? ''}
      fileMeta={
        activeAsset
          ? `${assetSource ? `${assetSource.split('\n').length} lines · ` : ''}${formatFileSize(activeAsset.size)}`
          : undefined
      }
      fileIcon={
        <FileIcon
          filename={activeAsset?.name ?? ''}
          extension={activeAsset?.extension}
          size="sm"
        />
      }
      actions={
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyRaw}
                  disabled={!canCopyRaw}
                  aria-label="Copy file contents"
                >
                  <Copy />
                  <span className="hidden sm:inline">Copy CSS</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">Copy file contents</TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            aria-label="Copy raw file URL"
          >
            <Link2 />
            <span className="hidden sm:inline">Raw URL</span>
          </Button>
          <Button asChild variant="ghost" size="icon-sm">
            <a href={activeAsset?.urlPath} download aria-label="Download file">
              <Download />
            </a>
          </Button>
        </>
      }
    >
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
    </CollectionDetailShell>
  )
}
