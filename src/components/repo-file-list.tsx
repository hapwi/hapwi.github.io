import { Link } from '@tanstack/react-router'
import { Folder } from 'lucide-react'
import { FileIcon } from '@/components/file-icon'
import { cn } from '@/lib/utils'
import type { LibraryAsset, LibraryFolder } from '@/lib/library'

type RepoFileListProps = {
  items: LibraryAsset[]
  folders?: LibraryFolder[]
  routePath: string
  showHeader?: boolean
  headerTitle?: string
  emptyMessage?: string
  className?: string
}

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
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'just now'
}

export function RepoFileList({
  items,
  folders,
  routePath,
  showHeader = true,
  headerTitle,
  emptyMessage = 'No files found',
  className,
}: RepoFileListProps) {
  const totalCount = (folders?.length ?? 0) + items.length

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-card', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">
              {headerTitle || `${totalCount} item${totalCount !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      )}

      {/* File list */}
      <div className="divide-y divide-border/50">
        {/* Folders first */}
        {folders?.map((folder) => {
          const hrefCandidate = folder.href ?? folder.subfolders[0]?.href ?? '/'
          const primaryHref = hrefCandidate.split('#')[0] || '/'
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
              className="group flex items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/40"
            >
              <Folder className="size-4 shrink-0 text-blue-400" />
              <span className="flex-1 truncate text-sm font-medium text-foreground group-hover:text-blue-500 group-hover:underline">
                {folder.title}
              </span>
              <span className="hidden text-sm text-muted-foreground sm:block truncate max-w-[40%]">
                {folder.description || ''}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatRelativeTime(latestMtime)}
              </span>
            </Link>
          )
        })}

        {/* Files */}
        {items.map((item) => (
          <Link
            key={item.urlPath}
            to={routePath}
            search={{ file: item.urlPath }}
            className="group flex items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/40"
          >
            <FileIcon filename={item.name} extension={item.extension} size="sm" />
            <span className="flex-1 truncate text-sm text-foreground group-hover:text-blue-500 group-hover:underline">
              {item.name}
            </span>
            <span className="hidden text-sm text-muted-foreground sm:block truncate max-w-[40%]">
              {item.description || ''}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {formatRelativeTime(item.mtime)}
            </span>
          </Link>
        ))}

        {/* Empty state */}
        {totalCount === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  )
}

// Simplified version for when we only have files
type SimpleFileListProps = {
  items: LibraryAsset[]
  routePath: string
  showHeader?: boolean
  className?: string
}

export function SimpleFileList({
  items,
  routePath,
  showHeader = true,
  className,
}: SimpleFileListProps) {
  return (
    <RepoFileList
      items={items}
      routePath={routePath}
      showHeader={showHeader}
      className={className}
    />
  )
}
