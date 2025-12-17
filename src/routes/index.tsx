import { Link, createFileRoute } from '@tanstack/react-router'
import { Folder, GitBranch, BarChart3 } from 'lucide-react'

import { folderGroups, codeLibrary } from '@/lib/library'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hr ago`
  if (minutes > 0) return `${minutes} min ago`
  return 'just now'
}

// Language colors matching GitHub's language colors
const languageColors: Record<string, string> = {
  css: '#563d7c',
  javascript: '#f1e05a',
  typescript: '#3178c6',
  html: '#e34c26',
  json: '#292929',
  markdown: '#083fa1',
}

function HomeRoute() {
  const directories = folderGroups
  const totalFiles = codeLibrary.length
  const latestUpdate = Math.max(...codeLibrary.map((f) => f.mtime || 0))
  const totalSize = codeLibrary.reduce((acc, f) => acc + (f.size || 0), 0)

  // Calculate language breakdown
  const languageStats = codeLibrary.reduce(
    (acc, file) => {
      const lang = file.language?.toLowerCase() || file.extension?.toLowerCase() || 'other'
      const normalizedLang = lang === 'userscript' ? 'javascript' : lang
      acc[normalizedLang] = (acc[normalizedLang] || 0) + (file.size || 0)
      return acc
    },
    {} as Record<string, number>
  )

  const sortedLanguages = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .map(([lang, size]) => ({
      name: lang.charAt(0).toUpperCase() + lang.slice(1),
      key: lang,
      size,
      percentage: (size / totalSize) * 100,
      color: languageColors[lang] || '#6e7681',
    }))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="space-y-6">
          {/* Repository description */}
          <p className="text-sm text-muted-foreground max-w-2xl">
            A collection of open source projects, Discord themes, and browser userscripts.
            Browse the source code directly or copy raw URLs for use in your projects.
          </p>

          {/* Main content area */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* File browser */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border bg-card">
                {/* Branch bar */}
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <GitBranch className="size-4 text-muted-foreground" />
                    <span className="font-medium">master</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{totalFiles}</span> files
                  </div>
                </div>

                {/* Directory list */}
                <div className="divide-y divide-border/50">
                  {directories.map((folder) => {
                    const hrefCandidate =
                      folder.href ?? folder.subfolders[0]?.href ?? '/'
                    const primaryHref = hrefCandidate.split('#')[0] || '/'
                    const itemCount = folder.subfolders.reduce(
                      (acc, sub) => acc + sub.items.length,
                      0
                    )
                    const latestMtime = folder.subfolders.reduce((max, sub) => {
                      const subLatest = sub.items.reduce(
                        (subMax, item) => Math.max(subMax, item.mtime ?? 0),
                        0
                      )
                      return Math.max(max, subLatest)
                    }, 0)

                    return (
                      <Link
                        key={folder.id}
                        to={primaryHref}
                        className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40"
                      >
                        <Folder className="size-4 shrink-0 text-blue-400" />
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground group-hover:text-blue-500 group-hover:underline">
                          {folder.title.toLowerCase().replace(/\s+/g, '-')}
                        </span>
                        <span className="hidden flex-shrink-0 text-sm text-muted-foreground md:block max-w-[45%] truncate text-right">
                          {folder.description || `${itemCount} files`}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums w-20 text-right">
                          {formatRelativeTime(latestMtime)}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* About */}
              <div className="rounded-lg border bg-card">
                <div className="border-b px-4 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    About
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Open source code library for Discord customization and browser automation.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Link
                      to="/discord-themes"
                      search={{ file: undefined }}
                      className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-500/20 dark:text-blue-400"
                    >
                      discord-themes
                    </Link>
                    <Link
                      to="/tampermonkey"
                      search={{ file: undefined }}
                      className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
                    >
                      userscripts
                    </Link>
                    <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                      open-source
                    </span>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="rounded-lg border bg-card">
                <div className="border-b px-4 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    Languages
                  </h3>
                </div>
                <div className="p-4">
                  {/* Language bar */}
                  <div className="flex h-2 overflow-hidden rounded-full">
                    {sortedLanguages.map((lang, i) => (
                      <div
                        key={lang.key}
                        className="h-full transition-all"
                        style={{
                          width: `${lang.percentage}%`,
                          backgroundColor: lang.color,
                          marginLeft: i > 0 ? '2px' : 0,
                        }}
                        title={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
                      />
                    ))}
                  </div>
                  {/* Language list */}
                  <div className="mt-3 space-y-2">
                    {sortedLanguages.map((lang) => (
                      <div key={lang.key} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-3 rounded-full"
                            style={{ backgroundColor: lang.color }}
                          />
                          <span className="text-foreground">{lang.name}</span>
                        </div>
                        <span className="text-muted-foreground tabular-nums">
                          {lang.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-lg border bg-card">
                <div className="border-b px-4 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <BarChart3 className="size-4 text-muted-foreground" />
                    Stats
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Files</span>
                    <span className="font-medium tabular-nums">{totalFiles}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total size</span>
                    <span className="font-medium tabular-nums">
                      {(totalSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last updated</span>
                    <span className="font-medium">{formatRelativeTime(latestUpdate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
