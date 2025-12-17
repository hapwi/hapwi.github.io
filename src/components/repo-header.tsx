import {
  Code,
  Clock,
  FileCode2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type RepoHeaderProps = {
  title: string
  description?: string
  stats?: {
    files?: number
    lastUpdated?: number
    language?: string
  }
  externalUrl?: string
  className?: string
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function RepoHeader({
  title,
  description,
  stats,
  externalUrl,
  className,
}: RepoHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Title and description */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FileCode2 className="size-5 text-muted-foreground" />
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {externalUrl && (
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <a href={externalUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 size-3.5" />
              View on GitHub
            </a>
          </Button>
        )}
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {stats.files !== undefined && (
            <div className="flex items-center gap-1.5">
              <Code className="size-4" />
              <span>{stats.files} files</span>
            </div>
          )}
          {stats.language && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'size-3 rounded-full',
                  stats.language.toLowerCase() === 'css' && 'bg-purple-500',
                  stats.language.toLowerCase() === 'javascript' && 'bg-yellow-400',
                  stats.language.toLowerCase() === 'typescript' && 'bg-blue-500',
                  !['css', 'javascript', 'typescript'].includes(
                    stats.language.toLowerCase()
                  ) && 'bg-gray-400'
                )}
              />
              <span>{stats.language}</span>
            </div>
          )}
          {stats.lastUpdated && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" />
              <span>Updated {formatDate(stats.lastUpdated)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for nested pages
type RepoSubHeaderProps = {
  title: string
  itemCount?: number
  lastUpdated?: number
  className?: string
}

export function RepoSubHeader({
  title,
  itemCount,
  lastUpdated,
  className,
}: RepoSubHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b bg-muted/30 px-4 py-2.5',
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-foreground">{title}</span>
        {itemCount !== undefined && (
          <span className="text-muted-foreground">
            ({itemCount} {itemCount === 1 ? 'file' : 'files'})
          </span>
        )}
      </div>
      {lastUpdated && (
        <span className="text-xs text-muted-foreground">
          Last updated {formatDate(lastUpdated)}
        </span>
      )}
    </div>
  )
}
