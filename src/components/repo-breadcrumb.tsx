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

export function RepoBreadcrumb({ segments, className }: RepoBreadcrumbProps) {
  return (
    <nav
      className={cn(
        'flex min-w-0 items-center gap-1 overflow-x-auto font-mono text-[0.8125rem]',
        className,
      )}
      aria-label="Breadcrumb"
    >
      <Link
        to="/"
        className="flex shrink-0 items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Folder className="size-3.5" aria-hidden="true" />
        <span>hapwi</span>
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1

        return (
          <div
            key={`${segment.label}-${index}`}
            className="flex min-w-0 items-center gap-1"
          >
            <ChevronRight
              className="size-3.5 shrink-0 text-muted-foreground/60"
              aria-hidden="true"
            />
            {segment.href && !isLast ? (
              <Link
                to={segment.href}
                params={segment.params as never}
                search={segment.search as never}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {segment.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'flex min-w-0 items-center gap-1.5',
                  isLast ? 'font-medium text-foreground' : 'text-foreground',
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {segment.isFile && segment.filename ? (
                  <FileIcon
                    filename={segment.filename}
                    size="sm"
                    className="shrink-0"
                  />
                ) : null}
                <span className="truncate">{segment.label}</span>
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
