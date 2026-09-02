import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Copy, Download, Link2, ExternalLink } from 'lucide-react'
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
  buildFetchAssetUrl,
  buildHostedAssetUrl,
  getCollectionDetailLocation,
  USERSCRIPT_SOURCE_URL,
} from '@/lib/collection-links'
import { formatFileSize, formatRelativeTime } from '@/lib/format'
import { folderGroups } from '@/lib/library'

export const Route = createFileRoute('/tampermonkey')({
  validateSearch: (search: Record<string, unknown>) => ({
    file: typeof search.file === 'string' ? search.file : undefined,
  }),
  component: TampermonkeyRoute,
})

const SCRIPTS_FOLDER_ID = 'tampermonkey/scripts'

const SOURCE_CACHE_PREFIX = 'tampermonkey:raw-source:v1:'
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

const HEADER_KEYS = ['name', 'version', 'description', 'match'] as const

function parseUserscriptHeader(source: string) {
  const block = source.split('// ==/UserScript==')[0] ?? ''
  const entries: Array<{ key: string; value: string }> = []
  for (const line of block.split('\n')) {
    const match = line.match(/^\/\/\s*@(\w+)\s+(.+?)\s*$/)
    if (!match) continue
    const [, key, value] = match
    if (
      key &&
      value &&
      (HEADER_KEYS as readonly string[]).includes(key) &&
      !entries.some((entry) => entry.key === key)
    ) {
      entries.push({ key, value })
    }
  }
  return entries
}

/** Renders the script's real `==UserScript==` metadata block. */
function UserscriptHeader({ urlPath }: { urlPath: string }) {
  const [entries, setEntries] = useState<Array<{
    key: string
    value: string
  }> | null>(() => {
    const cached = readCachedSource(urlPath)
    return cached ? parseUserscriptHeader(cached.text) : null
  })

  useEffect(() => {
    if (entries) return
    const controller = new AbortController()
    fetch(
      buildFetchAssetUrl(
        urlPath,
        typeof window === 'undefined' ? undefined : window.location.origin,
      ),
      { signal: controller.signal },
    )
      .then((response) => (response.ok ? response.text() : null))
      .then((text) => {
        if (text == null) return
        writeCachedSource(urlPath, text)
        setEntries(parseUserscriptHeader(text))
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [entries, urlPath])

  const width = Math.max(...HEADER_KEYS.map((key) => key.length)) + 1

  return (
    <pre className="m-0 flex flex-col justify-center overflow-x-auto border-b bg-code-surface px-5 py-5 font-mono text-xs leading-6 text-muted-foreground md:border-r md:border-b-0 sm:px-6">
      <span>// ==UserScript==</span>
      {entries
        ? entries.map((entry) => (
            <span key={entry.key} className="block">
              <span>// </span>
              <span className="text-brand">@{entry.key}</span>
              {' '.repeat(Math.max(1, width - entry.key.length))}
              <span className="text-foreground">{entry.value}</span>
            </span>
          ))
        : HEADER_KEYS.map((key) => (
            <span key={key} className="block">
              <span>// </span>
              <span className="text-brand">@{key}</span>
            </span>
          ))}
      <span className="block">// ==/UserScript==</span>
    </pre>
  )
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
    ? (scripts.find((asset) => asset.urlPath === selectedAssetPath) ?? null)
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
        const absoluteUrl = buildFetchAssetUrl(
          url,
          typeof window === 'undefined' ? undefined : window.location.origin,
        )
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

    void fetchSource(resolvedAssetUrl)

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

  // Show file list view when no file is selected
  if (!selectedAssetPath) {
    return (
      <>
        <PageLayout>
          <PageContent>
            <PageHeader
              title="Userscripts"
              description="Tampermonkey scripts for small browsing fixes. With Tampermonkey or Violentmonkey installed, opening a raw .user.js URL prompts the install and keeps the script updated from here."
              aside={
                <Button asChild variant="outline" size="sm">
                  <a
                    href={USERSCRIPT_SOURCE_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink data-icon="inline-start" />
                    Source repository
                  </a>
                </Button>
              }
            />

            <ul
              aria-label="Available userscripts"
              className="flex flex-col gap-5"
            >
              {scripts.map((item) => {
                const rawUrl = buildHostedAssetUrl(
                  item.urlPath,
                  typeof window === 'undefined'
                    ? undefined
                    : window.location.origin,
                )
                return (
                  <li
                    key={item.urlPath}
                    className="grid overflow-hidden rounded-2xl border bg-card md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
                  >
                    <UserscriptHeader urlPath={item.urlPath} />
                    <div className="flex flex-col">
                      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                        <div>
                          <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
                            {item.displayName}
                          </h2>
                          <p className="mt-1.5 text-[0.9375rem] leading-6 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 font-mono text-xs tabular-nums text-muted-foreground">
                          <dt>File</dt>
                          <dd className="truncate text-foreground">
                            {item.name}
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
                      </div>
                      <div className="flex flex-wrap items-center gap-2 border-t bg-muted/40 px-5 py-3 sm:px-6">
                        <Button asChild size="sm">
                          <a href={rawUrl} target="_blank" rel="noreferrer">
                            <ExternalLink data-icon="inline-start" />
                            Install
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link
                            {...getCollectionDetailLocation(
                              'scripts',
                              item.urlPath,
                            )}
                          >
                            View code
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void copyHostedUrl(item.urlPath)}
                        >
                          <Link2 data-icon="inline-start" />
                          Copy URL
                        </Button>
                      </div>
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
      backTo="/tampermonkey"
      collectionLabel="Scripts"
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
                  <span className="hidden sm:inline">Copy code</span>
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
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenUrl}
            aria-label="Install userscript"
          >
            <ExternalLink />
            <span className="hidden sm:inline">Install</span>
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
