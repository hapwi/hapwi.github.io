import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Copy, Download, Link2, ExternalLink, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

import { CodeFileViewer } from '@/components/code-file-viewer'
import { CollectionDetailShell } from '@/components/collection-detail-shell'
import { FileIcon } from '@/components/file-icon'
import { PageContent, PageHero, PageLayout } from '@/components/page-layout'
import { formatFileSize } from '@/components/library/meta-columns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
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
  buildFetchAssetUrl,
  buildHostedAssetUrl,
  getCollectionDetailLocation,
  USERSCRIPT_SOURCE_URL,
} from '@/lib/collection-links'
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
      <PageLayout>
        <PageContent>
          <PageHero
            label="Curated browser tools"
            title="Userscripts"
            description="Small, focused browser automations hosted as installable userscripts. Review the code, then install directly in Tampermonkey or another compatible manager."
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-5">
              {scripts.map((item) => (
                <Card key={item.urlPath} className="gap-0 overflow-hidden py-0">
                  <div className="bg-muted/40 p-3">
                    <div className="flex h-28 flex-col justify-center gap-2 overflow-hidden rounded-xl border bg-background px-5 font-mono text-xs sm:h-32">
                      <span className="text-muted-foreground">
                        // ==UserScript==
                      </span>
                      <span>
                        <span className="text-primary">@name</span>{' '}
                        {item.displayName}
                      </span>
                      <span>
                        <span className="text-primary">@match</span>{' '}
                        https://github.com/*
                      </span>
                    </div>
                  </div>
                  <CardHeader className="gap-2 px-5 pt-5 pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <CardTitle className="text-xl">
                        {item.displayName}
                      </CardTitle>
                      <Badge variant="outline">GitHub</Badge>
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {item.description ??
                        'A focused userscript for improving everyday browsing workflows.'}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto flex-wrap justify-end gap-2 border-t px-5 py-4">
                    <Button asChild size="sm">
                      <Link
                        {...getCollectionDetailLocation(
                          'scripts',
                          item.urlPath,
                        )}
                      >
                        View code
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <a
                        href={buildHostedAssetUrl(
                          item.urlPath,
                          typeof window === 'undefined'
                            ? undefined
                            : window.location.origin,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink data-icon="inline-start" />
                        Install
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={USERSCRIPT_SOURCE_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Alert>
              <ShieldAlert />
              <AlertTitle>Review before installing</AlertTitle>
              <AlertDescription>
                Userscripts can read and change matching pages. Inspect the code
                and permissions before adding one to your browser.
              </AlertDescription>
            </Alert>
          </div>
        </PageContent>
      </PageLayout>
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
