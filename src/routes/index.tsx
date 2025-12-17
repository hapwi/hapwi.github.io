import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRight, FileCode2, FolderOpen } from 'lucide-react'

import { LibraryUpdatedHeader, LibraryUpdatedValue } from '@/components/library/meta-columns'
import { folderGroups } from '@/lib/library'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function HomeRoute() {
  const directories = folderGroups

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="space-y-6">
          {/* File browser */}
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{directories.length} directories</span>
              </div>
              <LibraryUpdatedHeader className="pr-7" />
            </div>

            {/* Directory list */}
            <div className="divide-y divide-border/50">
              {directories.map((folder, index) => {
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
                    0,
                  )
                  return Math.max(max, subLatest)
                }, 0)

                return (
                  <Link
                    key={folder.id}
                    to={primaryHref}
                    className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-500/10 to-blue-600/5 ring-1 ring-blue-500/20">
                      <FolderOpen className="size-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {folder.title}
                        </span>
                        {itemCount > 0 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {itemCount} files
                          </span>
                        )}
                      </div>
                      {folder.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                          {folder.description}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      <LibraryUpdatedValue mtime={latestMtime} />
                      <ChevronRight className="size-4 text-muted-foreground/50 transition-all group-hover:text-muted-foreground group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* About section */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <div className="size-1.5 rounded-full bg-green-500" />
                About this repository
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                This repository hosts static assets including Discord themes and UI kits.
                Files are served directly from GitHub Pages, making it easy to link to raw files or browse previews.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <div className="size-1.5 rounded-full bg-blue-500" />
                Quick start
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Browse the directories above to find assets. Click on any file to view its contents and copy the direct URL for use in your projects.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
