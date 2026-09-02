import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Copy, Download, Link2 } from 'lucide-react'
import { toast } from 'sonner'

import { CodeFileViewer } from '@/components/code-file-viewer'
import { CollectionDetailShell } from '@/components/collection-detail-shell'
import { FileIcon } from '@/components/file-icon'
import { copyHostedUrl } from '@/components/hosted-files'
import { PageContent, PageHeader, PageLayout } from '@/components/page-layout'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  buildHostedAssetUrl,
  getCollectionDetailLocation,
} from '@/lib/collection-links'
import { formatFileSize, formatRelativeTime } from '@/lib/format'
import { folderGroups } from '@/lib/library'
import { getThemePresentation } from '@/lib/theme-presentation'

export const Route = createFileRoute('/discord-themes')({
  validateSearch: (search: Record<string, unknown>) => ({
    file: typeof search.file === 'string' ? search.file : undefined,
  }),
  component: DiscordThemesRoute,
})

const THEMES_FOLDER_ID = 'discord/themes'

const SOURCE_CACHE_PREFIX = 'discord-themes:raw-source:v1:'
const SOURCE_CACHE_MAX_ENTRIES = 25

function ThemePreview({ name }: { name: string }) {
  const { palette } = getThemePresentation(name)

  return (
    <div
      className="grid aspect-[16/9] grid-cols-[3rem_1fr] overflow-hidden sm:grid-cols-[3.5rem_1fr]"
      style={{ backgroundColor: palette[0] }}
      aria-hidden="true"
    >
      <div
        className="flex flex-col items-center gap-2 py-3"
        style={{ backgroundColor: palette[1] }}
      >
        <span
          className="size-6 rounded-full sm:size-7"
          style={{ backgroundColor: palette[2] }}
        />
        <span
          className="size-6 rounded-full opacity-60 sm:size-7"
          style={{ backgroundColor: palette[3] }}
        />
        <span
          className="size-6 rounded-full opacity-30 sm:size-7"
          style={{ backgroundColor: palette[3] }}
        />
      </div>
      <div className="flex flex-col justify-end gap-2 p-4">
        <span
          className="h-2.5 w-2/3 rounded-full opacity-90"
          style={{ backgroundColor: palette[2] }}
        />
        <span
          className="h-2.5 w-5/6 rounded-full opacity-55"
          style={{ backgroundColor: palette[3] }}
        />
        <span
          className="h-2.5 w-1/2 rounded-full opacity-40"
          style={{ backgroundColor: palette[3] }}
        />
        <span
          className="mt-1 h-8 rounded-md opacity-40"
          style={{ backgroundColor: palette[1] }}
        />
      </div>
    </div>
  )
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
      <>
        <PageLayout>
          <PageContent>
            <PageHeader
              title="Discord themes"
              description="Custom CSS for Vencord, Equicord, and other client mods. Paste a raw URL into your client's online themes list and it stays in sync with this repository."
              aside={
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {themeAssets.length}{' '}
                  {themeAssets.length === 1 ? 'file' : 'files'}
                </span>
              }
            />

            <ul
              aria-label="Hosted themes"
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {themeAssets.map((item) => {
                const presentation = getThemePresentation(item.name)
                const rawUrl = buildHostedAssetUrl(
                  item.urlPath,
                  typeof window === 'undefined'
                    ? undefined
                    : window.location.origin,
                )
                return (
                  <li
                    key={item.urlPath}
                    className="flex flex-col overflow-hidden rounded-2xl border bg-card"
                  >
                    <ThemePreview name={item.name} />
                    <div className="flex flex-1 flex-col gap-4 p-5">
                      <div>
                        <h2 className="font-display text-lg font-semibold">
                          {item.displayName}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 font-mono text-xs tabular-nums text-muted-foreground">
                        <dt>File</dt>
                        <dd className="truncate text-foreground">
                          {item.name}
                        </dd>
                        <dt>Base</dt>
                        <dd className="text-foreground">
                          {presentation.label}
                        </dd>
                        <dt>Size</dt>
                        <dd className="text-foreground">
                          {formatFileSize(item.size)}
                        </dd>
                        <dt>Updated</dt>
                        <dd className="text-foreground">
                          {formatRelativeTime(item.mtime)}
                        </dd>
                      </dl>
                      <code
                        className="block truncate rounded-md border bg-code-surface px-2.5 py-1.5 font-mono text-xs text-muted-foreground select-all"
                        title={rawUrl}
                      >
                        {rawUrl}
                      </code>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t bg-muted/40 px-5 py-3">
                      <Button asChild size="sm">
                        <Link
                          {...getCollectionDetailLocation(
                            'themes',
                            item.urlPath,
                          )}
                        >
                          View CSS
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void copyHostedUrl(item.urlPath)}
                      >
                        <Link2 data-icon="inline-start" />
                        Copy URL
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </PageContent>
        </PageLayout>
        <SiteFooter />
      </>
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
