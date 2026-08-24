import { Link } from '@tanstack/react-router'
import { ChevronRight, Folder } from 'lucide-react'

import { FileIcon } from '@/components/file-icon'
import { cn } from '@/lib/utils'

type BreadcrumbSegment = {
  label: string
  href?: string
  params?: Record<string, string>
  search?: Record<string, unknown>
  isFile?: boolean
  filename?: string
}

type RepoBreadcrumbProps = {
  segments: BreadcrumbSegment[]
  className?: string
}

export function RepoBreadcrumb({
  segments,
  className,
}: RepoBreadcrumbProps) {
  return (
    <nav
      className={cn(
        'flex min-w-0 items-center gap-1.5 overflow-x-auto rounded-md border bg-card px-3 py-2',
        className,
      )}
      aria-label="Breadcrumb"
    >
      <Link
        to="/"
        className="flex shrink-0 items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <Folder className="size-4 text-primary" />
        <span>hapwi</span>
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1

        return (
          <div key={`${segment.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
            {segment.href && !isLast ? (
              <Link
                to={segment.href}
                params={segment.params as never}
                search={segment.search as never}
                className="truncate font-mono text-sm text-foreground transition-colors hover:text-primary"
              >
                {segment.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'flex min-w-0 items-center gap-1.5 text-sm',
                  isLast ? 'font-medium text-foreground' : 'text-foreground',
                )}
              >
                {segment.isFile && segment.filename ? (
                  <FileIcon
                    filename={segment.filename}
                    size="sm"
                    className="shrink-0"
                  />
                ) : null}
                <span
                  className={cn(
                    'truncate',
                    isLast && segment.isFile ? 'text-muted-foreground' : 'font-mono',
                  )}
                >
                  {segment.label}
                </span>
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
