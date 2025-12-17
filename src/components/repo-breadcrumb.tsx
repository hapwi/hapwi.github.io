import { Link } from '@tanstack/react-router'
import { ChevronRight, Folder } from 'lucide-react'
import { FileIcon } from '@/components/file-icon'
import { cn } from '@/lib/utils'

type BreadcrumbSegment = {
  label: string
  href?: string
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
        'flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2',
        className
      )}
      aria-label="Breadcrumb"
    >
      {/* Root/repo link */}
      <Link
        to="/"
        className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-blue-500"
      >
        <Folder className="size-4 text-blue-400" />
        <span>hapwi</span>
      </Link>

      {/* Path segments */}
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1

        return (
          <div key={index} className="flex items-center gap-1.5">
            <ChevronRight className="size-4 text-muted-foreground/50" />
            {segment.href && !isLast ? (
              <Link
                to={segment.href}
                search={segment.search as any}
                className="text-sm font-medium text-foreground transition-colors hover:text-blue-500"
              >
                {segment.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'flex items-center gap-1.5 text-sm',
                  isLast ? 'font-medium text-foreground' : 'text-foreground'
                )}
              >
                {segment.isFile && segment.filename && (
                  <FileIcon
                    filename={segment.filename}
                    size="sm"
                    className="shrink-0"
                  />
                )}
                <span className={isLast && segment.isFile ? 'text-muted-foreground' : ''}>
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
