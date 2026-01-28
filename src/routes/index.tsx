import { Link, createFileRoute } from '@tanstack/react-router'
import { Folder, BarChart3, Sparkles, ArrowRight } from 'lucide-react'

import {
  PageLayout,
  PageHeader,
  PageContent,
  PageGrid,
  PageMain,
  PageSidebar,
  SidebarCard,
  SidebarCardHeader,
  FileListCard,
} from '@/components/page-layout'
import { folderGroups, codeLibrary, type LibraryFolder } from '@/lib/library'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function formatRelativeTime(timestamp: number): string {
  if (!timestamp || timestamp <= 0) return ''
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

// Language colors - refined editorial palette
const languageColors: Record<string, string> = {
  css: '#7c3aed',
  javascript: '#eab308',
  typescript: '#3b82f6',
  html: '#f97316',
  json: '#6b7280',
  markdown: '#2563eb',
}

function HomeRoute() {
  const externalDirectories: LibraryFolder[] = [
    {
      id: 'bbpcn',
      title: 'BBPCN',
      description: 'Live GitHub repository view',
      href: '/bbpcn',
      totalItems: 0,
      subfolders: [],
    },
  ]

  const directories = [...folderGroups, ...externalDirectories].sort((a, b) =>
    a.title.localeCompare(b.title),
  )
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
      color: languageColors[lang] || '#94a3b8',
    }))

  return (
    <PageLayout>
      <PageContent>
        {/* Editorial Hero Section */}
        <PageHeader>
          <div className="editorial-accent-line" />
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            Open Source Code Library
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            A curated collection of Discord themes, browser userscripts, and open source projects.
            Browse source code directly or copy raw URLs for your projects.
          </p>
        </PageHeader>

        <PageGrid>
          <PageMain>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-base sm:text-lg font-medium">Directories</h2>
              <span className="text-xs sm:text-sm tabular-nums text-muted-foreground shrink-0">
                {totalFiles} files
              </span>
            </div>

            <FileListCard>
              {directories.map((folder) => {
                const hrefCandidate = folder.href ?? folder.subfolders[0]?.href ?? '/'
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
                    className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <Folder className="size-4 sm:size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {folder.title}
                        </span>
                        <ArrowRight className="size-3.5 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary hidden sm:block" />
                      </div>
                      <p className="mt-0.5 truncate text-xs sm:text-sm text-muted-foreground">
                        {folder.description || `${itemCount} files`}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground hidden xs:block">
                      {formatRelativeTime(latestMtime)}
                    </span>
                  </Link>
                )
              })}
            </FileListCard>
          </PageMain>

          <PageSidebar>
            {/* About Card */}
            <SidebarCard>
              <SidebarCardHeader icon={<Sparkles className="size-4" />} title="About" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Open source code library for Discord customization and browser automation tools.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/discord-themes"
                  search={{ file: undefined }}
                  className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  Themes
                </Link>
                <Link
                  to="/tampermonkey"
                  search={{ file: undefined }}
                  className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 transition-colors hover:bg-amber-500/10"
                >
                  Scripts
                </Link>
                <Link
                  to="/bbpcn"
                  search={{ file: undefined, path: undefined }}
                  className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/5 px-2.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-400 transition-colors hover:bg-violet-500/10"
                >
                  BBPCN
                </Link>
              </div>
            </SidebarCard>

            {/* Languages Card */}
            <SidebarCard>
              <SidebarCardHeader title="Languages" />
              <div className="flex h-2 sm:h-2.5 overflow-hidden rounded-full bg-muted">
                {sortedLanguages.map((lang) => (
                  <div
                    key={lang.key}
                    className="h-full transition-all first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                    }}
                    title={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
                  />
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {sortedLanguages.map((lang) => (
                  <div key={lang.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2.5 shrink-0 rounded-full ring-2 ring-background"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="font-medium text-foreground truncate">{lang.name}</span>
                    </div>
                    <span className="tabular-nums text-muted-foreground shrink-0 ml-2">
                      {lang.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </SidebarCard>

            {/* Stats Card */}
            <SidebarCard>
              <SidebarCardHeader icon={<BarChart3 className="size-4" />} title="Statistics" />
              <dl className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-muted-foreground">Total files</dt>
                  <dd className="font-mono text-sm font-medium tabular-nums">{totalFiles}</dd>
                </div>
                <div className="editorial-divider" />
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-muted-foreground">Total size</dt>
                  <dd className="font-mono text-sm font-medium tabular-nums">
                    {(totalSize / 1024).toFixed(1)} KB
                  </dd>
                </div>
                <div className="editorial-divider" />
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-muted-foreground">Last updated</dt>
                  <dd className="text-sm font-medium">{formatRelativeTime(latestUpdate)}</dd>
                </div>
              </dl>
            </SidebarCard>
          </PageSidebar>
        </PageGrid>
      </PageContent>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 pt-6 border-t border-border/50">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            <span className="font-display font-medium text-foreground">hapwi</span>
            {' '}&middot;{' '}Open source code library
          </p>
          <nav className="flex items-center gap-4 sm:gap-6">
            <a
              href="https://github.com/hapwi"
              target="_blank"
              rel="noreferrer"
              className="editorial-link text-xs sm:text-sm text-muted-foreground hover:text-foreground"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </PageLayout>
  )
}
