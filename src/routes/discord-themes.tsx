import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, FileCode2, FolderOpen } from 'lucide-react'

import { CodeFileViewer } from '@/components/code-file-viewer'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { codeLibrary, findFeaturedAsset, folderGroups } from '@/lib/library'

export const Route = createFileRoute('/discord-themes')({
  component: DiscordThemesRoute,
})

const fileSizeUnits = ['B', 'KB', 'MB', 'GB', 'TB']
const updatedFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < fileSizeUnits.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  const precision = size >= 10 || unitIndex === 0 ? 0 : 1
  return `${size.toFixed(precision)} ${fileSizeUnits[unitIndex]}`
}

function formatUpdatedAt(ms: number) {
  return updatedFormatter.format(ms)
}

function toAnchorId(value: string) {
  return `folder-${value.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
}

const THEMES_FOLDER_ID = 'discord/themes'
const FEATURED_THEME_PATH = 'discord/themes/custompuccin.custom.css'
const PRODUCTION_ORIGIN = 'https://hapwi.github.io'

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

  const defaultAsset =
    themeAssets[0] ??
    findFeaturedAsset(FEATURED_THEME_PATH) ??
    codeLibrary[0]

  const [selectedAssetPath, setSelectedAssetPath] = useState(
    defaultAsset?.urlPath ?? '',
  )

  const [assetSource, setAssetSource] = useState<string | null>(null)
  const [isLoadingSource, setIsLoadingSource] = useState(false)
  const [sourceError, setSourceError] = useState<string | null>(null)
  const prioritizedThemeItems = useMemo(() => {
    if (!themeSubfolder) return []
    if (!defaultAsset) return themeSubfolder.items

    const remaining = themeSubfolder.items.filter(
      (item) => item.urlPath !== defaultAsset.urlPath,
    )
    return [defaultAsset, ...remaining]
  }, [themeSubfolder, defaultAsset])

  const activeAsset =
    themeAssets.find((asset) => asset.urlPath === selectedAssetPath) ??
    defaultAsset ??
    null

  const assetUrl = activeAsset?.urlPath ?? null

  useEffect(() => {
    if (!assetUrl) {
      setAssetSource(null)
      setSourceError(null)
      return
    }

    let cancelled = false
    const controller = new AbortController()

    async function fetchSource() {
      setIsLoadingSource(true)
      setSourceError(null)

      try {
        const response = await fetch(assetUrl, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const text = await response.text()
        if (!cancelled) {
          setAssetSource(text)
        }
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        console.error('Failed to load asset source:', err)
        setAssetSource(null)
        setSourceError('Unable to load a highlighted preview for this file.')
      } finally {
        if (!cancelled) {
          setIsLoadingSource(false)
        }
      }
    }

    fetchSource()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [assetUrl])

  const highlightLanguage = useMemo(() => {
    if (!activeAsset) return 'txt'

    const normalizedLabel = activeAsset.language
      ?.toLowerCase()
      .replace(/\s+/g, '-')
    const extension = activeAsset.extension?.toLowerCase()

    if (normalizedLabel && normalizedLabel !== 'file') {
      return normalizedLabel
    }

    if (extension) {
      return extension
    }

    return 'txt'
  }, [activeAsset])

  const languageLabel =
    activeAsset?.language ?? activeAsset?.extension?.toUpperCase() ?? 'FILE'

  const absoluteAssetUrl = useMemo(() => {
    if (!activeAsset) return null
    return buildAbsoluteAssetUrl(activeAsset.urlPath)
  }, [activeAsset])

  const hasAssets = themeAssets.length > 0
  const selectValue = hasAssets ? selectedAssetPath : ''

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 pb-16 pt-14 sm:gap-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-24">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-5">
            <Badge
              variant="secondary"
              className="w-fit rounded-md px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em]"
            >
              Discord Themes
            </Badge>
            <div className="space-y-3">
              <h1 className="text-pretty text-3xl font-semibold leading-tight sm:text-4xl">
                Curated CSS themes for Discord client mods.
              </h1>
              <p className="text-balance text-sm text-muted-foreground sm:text-base">
                Preview highlighted code, copy raw sources, and share production-ready links served
                from{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  public/discord/themes/
                </code>
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href="#library">
                  View library
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              {activeAsset ? (
                <Button asChild size="sm" className="gap-2">
                  <a href={activeAsset.urlPath} target="_blank" rel="noreferrer">
                    Open {activeAsset.displayName}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          <Card className="flex h-full flex-col border bg-card shadow-sm">
            <CardHeader className="space-y-2 pb-0">
              <CardTitle className="text-2xl font-semibold">
                Selected theme
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Choose a file to inspect its metadata and copy an absolute link to GitHub Pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label
                  htmlFor="theme-select"
                  className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Select a theme
                </Label>
                <Select
                  value={selectValue ?? ''}
                  onValueChange={(value) => setSelectedAssetPath(value)}
                  disabled={!hasAssets}
                >
                  <SelectTrigger id="theme-select" className="w-full">
                    <SelectValue placeholder="No themes available" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {discordFolder?.subfolders.map((subfolder) => (
                      <SelectGroup key={subfolder.id}>
                        <SelectLabel>{subfolder.title}</SelectLabel>
                        {(subfolder.id === THEMES_FOLDER_ID
                          ? prioritizedThemeItems
                          : subfolder.items
                        ).map((asset) => (
                          <SelectItem key={asset.urlPath} value={asset.urlPath}>
                            {asset.displayName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {activeAsset ? (
                  <p className="text-xs text-muted-foreground">
                    {activeAsset.description}
                  </p>
                ) : null}
              </div>
              <Separator />
              <dl className="grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/40 px-3 py-3">
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    File name
                  </dt>
                  <dd className="mt-1 truncate text-sm text-foreground">
                    {activeAsset?.displayName ?? 'Not available'}
                  </dd>
                </div>
                <div className="rounded-lg border bg-muted/40 px-3 py-3">
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Path
                  </dt>
                  <dd className="mt-1 truncate text-sm text-foreground">
                    {activeAsset?.urlPath ?? '—'}
                  </dd>
                </div>
                <div className="rounded-lg border bg-muted/40 px-3 py-3">
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Size
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {activeAsset ? formatFileSize(activeAsset.size) : '—'}
                  </dd>
                </div>
                <div className="rounded-lg border bg-muted/40 px-3 py-3">
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Updated
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {activeAsset ? formatUpdatedAt(activeAsset.mtime) : '—'}
                  </dd>
                </div>
              </dl>
            </CardContent>
            {activeAsset ? (
              <CardFooter className="mt-auto flex flex-wrap items-center gap-3 pt-0">
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="group gap-2 px-0 text-sm font-semibold text-primary"
                >
                  <a href={activeAsset.urlPath} target="_blank" rel="noreferrer">
                    Open {activeAsset.displayName}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </CardFooter>
            ) : null}
          </Card>
        </section>

        <section aria-label="Theme preview">
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
          ) : (
            <Card className="border bg-card shadow-sm">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg font-semibold">
                  No theme selected
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Pick a file from the selector above to load a highlighted preview and copy
                  production URLs.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>

        <section id="library" className="space-y-8">
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="w-fit rounded-md px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em]"
            >
              Library
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight">All Discord themes</h2>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Browse every hosted theme. Each link serves directly from GitHub Pages so you can share
              or download without leaving this site.
            </p>
          </div>

          <div className="space-y-5">
            {discordFolder?.subfolders.map((subfolder) => (
              <Card
                key={subfolder.id}
                id={toAnchorId(subfolder.id)}
                className="border bg-card shadow-sm scroll-mt-24"
              >
                <CardHeader className="gap-2 border-b pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <FolderOpen className="mt-0.5 size-4 text-primary" />
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold">
                          {subfolder.title}
                        </CardTitle>
                        {subfolder.description ? (
                          <CardDescription className="text-xs text-muted-foreground">
                            {subfolder.description}
                          </CardDescription>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <ScrollArea className="max-h-none pr-2 md:max-h-80">
                    <div className="space-y-2.5">
                      {(subfolder.id === THEMES_FOLDER_ID
                        ? prioritizedThemeItems
                        : subfolder.items
                      ).map((item) => (
                        <a
                          key={item.urlPath}
                          href={item.urlPath}
                          className="group block rounded-lg border border-border/60 bg-muted/20 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <FileCode2 className="size-4 text-primary transition-transform group-hover:scale-105" />
                              <span className="text-sm font-medium text-foreground">
                                {item.displayName}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="uppercase tracking-[0.16em] text-[0.62rem]"
                            >
                              {item.language}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.7rem] text-muted-foreground">
                            <span className="truncate">{item.relativePath}</span>
                            <span>• {formatFileSize(item.size)}</span>
                            <span>• Updated {formatUpdatedAt(item.mtime)}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
