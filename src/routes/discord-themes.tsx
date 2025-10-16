import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, FileCode2, FolderOpen } from 'lucide-react'

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

function DiscordThemesRoute() {
  const discordFolder =
    folderGroups.find((folder) => folder.id === 'discord') ?? null
  const themeSubfolder =
    discordFolder?.subfolders.find((sub) => sub.id === THEMES_FOLDER_ID) ?? null
  const themeAssets = themeSubfolder?.items ?? []

  const defaultAsset =
    findFeaturedAsset(FEATURED_THEME_PATH) ?? themeAssets[0] ?? codeLibrary[0]

  const [selectedAssetPath, setSelectedAssetPath] = useState(
    defaultAsset?.urlPath ?? '',
  )

  const activeAsset =
    themeAssets.find((asset) => asset.urlPath === selectedAssetPath) ??
    defaultAsset ??
    null

  const hasAssets = themeAssets.length > 0
  const selectValue = hasAssets ? selectedAssetPath : ''

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:gap-24 lg:pb-24">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
          <div className="space-y-6">
            <Badge
              variant="secondary"
              className="w-fit rounded-full px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] sm:text-xs sm:tracking-[0.3em]"
            >
              Discord Themes
            </Badge>
            <h1 className="text-pretty text-4xl font-semibold leading-tight sm:text-5xl">
              Curated CSS themes for Discord client mods.
            </h1>
            <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
              Every file here lives inside <code>public/discord/themes/</code>. Pick a theme to
              inspect its metadata, download the raw CSS, or share a stable link that serves
              directly from GitHub Pages.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="lg" className="gap-2">
                <a href="#library">
                  View library
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              {activeAsset ? (
                <Button asChild size="lg" className="gap-2">
                  <a href={activeAsset.urlPath} target="_blank" rel="noreferrer">
                    Open {activeAsset.displayName}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          <Card className="flex h-full flex-col border bg-card shadow-sm">
            <CardHeader className="space-y-3 pb-3">
              <CardTitle className="text-2xl font-semibold">
                Selected theme
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Use the selector to preview file details, grab the raw URL, or jump straight to the
                hosted asset.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="theme-select"
                  className="block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground"
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
                        {subfolder.items.map((asset) => (
                          <SelectItem key={asset.urlPath} value={asset.urlPath}>
                            {asset.displayName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {activeAsset ? (
                  <p className="text-xs text-muted-foreground">{activeAsset.description}</p>
                ) : null}
              </div>
              <Separator />
              <dl className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <dt className="font-medium text-foreground">File name</dt>
                  <dd className="truncate">
                    {activeAsset?.displayName ?? 'Not available'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Path</dt>
                  <dd className="truncate">{activeAsset?.urlPath ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Size</dt>
                  <dd>
                    {activeAsset ? formatFileSize(activeAsset.size) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Updated</dt>
                  <dd>
                    {activeAsset ? formatUpdatedAt(activeAsset.mtime) : '—'}
                  </dd>
                </div>
              </dl>
            </CardContent>
            {activeAsset ? (
              <CardFooter className="mt-auto pt-0">
                <Button
                  asChild
                  variant="ghost"
                  className="group px-0 text-sm font-semibold text-primary"
                >
                  <a href={activeAsset.urlPath} target="_blank" rel="noreferrer">
                    Open {activeAsset.displayName}
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </CardFooter>
            ) : null}
          </Card>
        </section>

        <section id="library" className="space-y-8">
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="w-fit rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.28em]"
            >
              Library
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight">All Discord themes</h2>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Themes are served as raw CSS from GitHub Pages. Share the direct URL or download the
              file to customize locally.
            </p>
          </div>

        <div className="space-y-5">
            {discordFolder?.subfolders.map((subfolder) => (
              <Card
                key={subfolder.id}
                id={toAnchorId(subfolder.id)}
                className="border bg-card shadow-sm scroll-mt-28"
              >
                <CardHeader className="gap-3 border-b pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <FolderOpen className="mt-1 size-4 text-primary" />
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
                <CardContent className="space-y-5 pt-4">
                  <ScrollArea className="max-h-80 pr-2">
                    <div className="space-y-3">
                      {subfolder.items.map((item) => (
                        <a
                          key={item.urlPath}
                          href={item.urlPath}
                          className="group block rounded-lg border border-border/40 bg-card/80 px-3 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5"
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
                              className="uppercase tracking-[0.16em] text-[0.58rem]"
                            >
                              {item.language}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.65rem] text-muted-foreground">
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
