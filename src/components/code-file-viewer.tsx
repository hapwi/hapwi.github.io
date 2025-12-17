import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import { useTheme } from '@/components/theme-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const HIGHLIGHT_CACHE_PREFIX = 'code-viewer-shiki:v1:'
const HIGHLIGHT_CACHE_MAX_ENTRIES = 25

type CachedHighlight = {
  html: string
  bg: string | null
  fg: string | null
  updatedAt: number
  sourceHash: string
}

function hashFNV1a(input: string) {
  let hash = 0x811c9dc5
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16)
}

function getHighlightCacheKey({
  sourceUrl,
  language,
  theme,
}: {
  sourceUrl: string | null | undefined
  language: string
  theme: string
}) {
  const identity = sourceUrl ? `url:${sourceUrl}` : 'inline'
  return `${HIGHLIGHT_CACHE_PREFIX}${identity}|lang:${language}|theme:${theme}`
}

function readCachedHighlight(key: string) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedHighlight
    if (!parsed?.html || typeof parsed.updatedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function pruneHighlightCache() {
  if (typeof window === 'undefined') return
  try {
    const keys: string[] = []
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key && key.startsWith(HIGHLIGHT_CACHE_PREFIX)) keys.push(key)
    }

    if (keys.length <= HIGHLIGHT_CACHE_MAX_ENTRIES) return

    const entries = keys
      .map((key) => ({ key, cached: readCachedHighlight(key) }))
      .filter((entry) => entry.cached)
      .sort((a, b) => (a.cached!.updatedAt ?? 0) - (b.cached!.updatedAt ?? 0))

    const removeCount = Math.max(0, entries.length - HIGHLIGHT_CACHE_MAX_ENTRIES)
    for (let index = 0; index < removeCount; index += 1) {
      window.localStorage.removeItem(entries[index]!.key)
    }
  } catch {
    // ignore cache eviction failures
  }
}

function writeCachedHighlight(key: string, value: CachedHighlight) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    pruneHighlightCache()
  } catch {
    // ignore storage quota / serialization issues
  }
}

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
  highlightLanguage,
  source,
  sourceUrl,
  isLoading = false,
  error = null,
  theme: themeOverride,
}: CodeFileViewerProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)
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

    setColorMode(themeSetting)
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
    if (typeof window === 'undefined') return
    const cacheKey = getHighlightCacheKey({
      sourceUrl,
      language: safeLanguage,
      theme: shikiTheme,
    })
    const cached = readCachedHighlight(cacheKey)
    setHighlightedHtml(cached?.html ?? null)
    setShikiBackground(cached?.bg ?? null)
    setShikiForeground(cached?.fg ?? null)
    setIsRendering(false)
  }, [sourceUrl, safeLanguage, shikiTheme])

  useEffect(() => {
    let cancelled = false

    if (error) {
      setHighlightedHtml(null)
      setIsRendering(false)
      setShikiBackground(null)
      setShikiForeground(null)
      return
    }

    if (source == null) {
      setIsRendering(false)
      return
    }

    const safeSource = source
    const cacheKey = getHighlightCacheKey({
      sourceUrl,
      language: safeLanguage,
      theme: shikiTheme,
    })
    const sourceHash = hashFNV1a(safeSource)

    const cached = readCachedHighlight(cacheKey)
    if (cached?.sourceHash === sourceHash) {
      setHighlightedHtml(cached.html)
      setShikiBackground(cached.bg ?? null)
      setShikiForeground(cached.fg ?? null)
      setIsRendering(false)
      return
    }

    async function renderHighlight() {
      setIsRendering(true)
      try {
        const { codeToHtml } = await import('shiki')
        const html = await codeToHtml(safeSource, {
          lang: safeLanguage,
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
              const bg = backgroundMatch?.[1]?.trim() ?? null
              const fg = colorMatch?.[1]?.trim() ?? null
              setShikiBackground(bg)
              setShikiForeground(fg)

              writeCachedHighlight(cacheKey, {
                html,
                bg,
                fg,
                updatedAt: Date.now(),
                sourceHash,
              })
            } else {
              setShikiBackground(null)
              setShikiForeground(null)

              writeCachedHighlight(cacheKey, {
                html,
                bg: null,
                fg: null,
                updatedAt: Date.now(),
                sourceHash,
              })
            }
          } else {
            writeCachedHighlight(cacheKey, {
              html,
              bg: null,
              fg: null,
              updatedAt: Date.now(),
              sourceHash,
            })
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
  }, [source, safeLanguage, shikiTheme, error, sourceUrl])

  const showSkeleton = (isLoading && !highlightedHtml) || (isRendering && !highlightedHtml)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {error ? (
        <div className="flex flex-1 items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overscroll-none overflow-auto bg-transparent">
          <div className="relative">
            {showSkeleton ? (
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Loading syntax highlighting…</span>
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
                className={cn('code-viewer-shiki font-mono text-sm leading-relaxed')}
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
        </div>
      )}
    </div>
  )
}
