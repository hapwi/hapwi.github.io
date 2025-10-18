import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Link2, Loader2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'

type CodeFileViewerProps = {
  fileName: string
  languageLabel: string
  highlightLanguage: string
  source: string | null
  sourceUrl?: string | null
  isLoading?: boolean
  error?: string | null
  theme?: string
}

export function CodeFileViewer({
  fileName,
  languageLabel,
  highlightLanguage,
  source,
  sourceUrl = null,
  isLoading = false,
  error = null,
  theme: themeOverride,
}: CodeFileViewerProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [copyLinkState, setCopyLinkState] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  )
  const [shikiBackground, setShikiBackground] = useState<string | null>(null)
  const [shikiForeground, setShikiForeground] = useState<string | null>(null)

  const { theme: themeSetting } = useTheme()
  const [colorMode, setColorMode] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (themeSetting === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const update = () => setColorMode(media.matches ? 'dark' : 'light')
      update()
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    setColorMode(themeSetting ?? 'dark')
  }, [themeSetting])

  const safeLanguage = useMemo(() => {
    if (!highlightLanguage) return 'txt'
    return highlightLanguage.trim().toLowerCase()
  }, [highlightLanguage])

  const shikiTheme = useMemo(() => {
    if (themeOverride) return themeOverride
    return colorMode === 'light' ? 'github-light-default' : 'github-dark-default'
  }, [themeOverride, colorMode])

  useEffect(() => {
    let cancelled = false

    if (source == null || error) {
      setHighlightedHtml(null)
      setIsRendering(false)
      setShikiBackground(null)
      setShikiForeground(null)
      return
    }

    const safeSource = source

    async function renderHighlight() {
      setIsRendering(true)
      try {
        const { codeToHtml } = await import('shiki')
        const html = await codeToHtml(safeSource, {
          lang: safeLanguage || 'txt',
          theme: shikiTheme,
        })

        if (!cancelled) {
          setHighlightedHtml(html)
          if (typeof window !== 'undefined') {
            const parser = document.createElement('div')
            parser.innerHTML = html
            const preElement = parser.querySelector('pre')
            if (preElement) {
              const styleAttr = preElement.getAttribute('style') ?? ''
              const backgroundMatch = styleAttr.match(
                /background-color:\s*([^;]+);?/i,
              )
              const colorMatch = styleAttr.match(/color:\s*([^;]+);?/i)
              setShikiBackground(backgroundMatch?.[1]?.trim() ?? null)
              setShikiForeground(colorMatch?.[1]?.trim() ?? null)
            } else {
              setShikiBackground(null)
              setShikiForeground(null)
            }
          }
        }
      } catch (err) {
        console.error('Failed to render code preview with Shiki:', err)
        if (!cancelled) {
          setHighlightedHtml(null)
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false)
        }
      }
    }

    renderHighlight()

    return () => {
      cancelled = true
    }
  }, [source, safeLanguage, shikiTheme, error])

  const showSkeleton = isLoading || isRendering

  const tooltipCopyLabel =
    copyState === 'copied'
      ? 'Copied!'
      : copyState === 'error'
        ? 'Unable to copy'
        : 'Copy file contents'

  const tooltipLinkLabel =
    copyLinkState === 'copied'
      ? 'Link copied'
      : copyLinkState === 'error'
        ? 'Unable to copy link'
        : 'Copy raw file URL'

  async function handleCopy() {
    if (source == null) return

    try {
      const safeSource = source
      await navigator.clipboard.writeText(safeSource)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch (err) {
      console.error('Clipboard copy failed:', err)
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 2500)
    }
  }

  async function handleCopyUrl() {
    if (!sourceUrl) return

    try {
      await navigator.clipboard.writeText(sourceUrl)
      setCopyLinkState('copied')
      setTimeout(() => setCopyLinkState('idle'), 2000)
    } catch (err) {
      console.error('Clipboard copy link failed:', err)
      setCopyLinkState('error')
      setTimeout(() => setCopyLinkState('idle'), 2500)
    }
  }

  return (
    <Card className="h-full border bg-card shadow-sm">
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div className="space-y-1">
          <CardTitle className="font-mono text-sm">{fileName}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Rendered with Shiki syntax highlighting.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="font-mono text-[0.65rem] uppercase tracking-[0.16em]"
          >
            {languageLabel}
          </Badge>
          <div className="flex items-center gap-1.5">
            {sourceUrl ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopyUrl}
                    disabled={sourceUrl == null}
                    className="size-8"
                  >
                    {copyLinkState === 'copied' ? (
                      <Check className="size-4" />
                    ) : (
                      <Link2 className="size-4" />
                    )}
                    <span className="sr-only">Copy raw file URL</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tooltipLinkLabel}</TooltipContent>
              </Tooltip>
            ) : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopy}
                  disabled={isLoading || source == null}
                  className="size-8"
                >
                  {copyState === 'copied' ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  <span className="sr-only">Copy file contents</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tooltipCopyLabel}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-[18rem] flex-col gap-3">
        {error ? (
          <div className="flex flex-1 items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
            {error}
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh] min-h-[18rem] flex-1 overflow-hidden rounded-md border border-border/70 bg-transparent sm:max-h-[65vh]">
            <div className="relative">
              {showSkeleton ? (
                <div className="space-y-3 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Loading highlighted preview…</span>
                  </div>
                  <Skeleton className="h-3 w-[95%]" />
                  <Skeleton className="h-3 w-[90%]" />
                  <Skeleton className="h-3 w-[92%]" />
                  <Skeleton className="h-3 w-[88%]" />
                  <Skeleton className="h-3 w-[93%]" />
                  <Skeleton className="h-3 w-[85%]" />
                </div>
              ) : highlightedHtml ? (
                <div
                  className={cn(
                    'code-viewer-shiki min-h-[16rem] font-mono text-sm leading-relaxed',
                  )}
                  style={
                    {
                      '--code-viewer-bg': shikiBackground ?? undefined,
                      '--code-viewer-fg': shikiForeground ?? undefined,
                    } as CSSProperties
                  }
                  dangerouslySetInnerHTML={{
                    __html: highlightedHtml,
                  }}
                />
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  No preview available.
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
