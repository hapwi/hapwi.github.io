import { Clock } from 'lucide-react'

import { cn } from '@/lib/utils'

const fileSizeUnits = ['B', 'KB', 'MB', 'GB', 'TB']

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < fileSizeUnits.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  const precision = size >= 10 || unitIndex === 0 ? 0 : 1
  return `${size.toFixed(precision)} ${fileSizeUnits[unitIndex]}`
}

export function formatLastUpdated(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '—'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(timestamp))
}

const metaGrid = 'grid grid-cols-[8rem_3.25rem] items-center justify-items-end gap-2'

export function LibraryMetaHeader({ className }: { className?: string }) {
  return (
    <div className={cn('hidden sm:block', className)}>
      <div className={cn(metaGrid, 'text-xs text-muted-foreground')}>
        <span className="flex items-center justify-end gap-1.5 text-right">
          <Clock className="size-3.5 shrink-0" />
          <span>Last updated</span>
        </span>
        <span>Size</span>
      </div>
    </div>
  )
}

const updatedGrid = 'grid grid-cols-[8rem] items-center justify-items-end'

export function LibraryUpdatedHeader({ className }: { className?: string }) {
  return (
    <div className={cn('hidden sm:block', className)}>
      <div className={cn(updatedGrid, 'text-xs text-muted-foreground')}>
        <span className="flex items-center justify-end gap-1.5 text-right">
          <Clock className="size-3.5 shrink-0" />
          <span>Last updated</span>
        </span>
      </div>
    </div>
  )
}

export function LibraryMetaValues({
  mtime,
  size,
  className,
}: {
  mtime: number
  size: number
  className?: string
}) {
  return (
    <div className={cn('shrink-0', className)}>
      <div className={cn(metaGrid, 'text-right')}>
        <div
          className="hidden sm:block text-xs font-medium text-muted-foreground tabular-nums"
          title={mtime > 0 ? new Date(mtime).toLocaleString() : undefined}
        >
          {formatLastUpdated(mtime)}
        </div>
        <div className="text-xs font-medium text-muted-foreground tabular-nums">
          {formatFileSize(size)}
        </div>
      </div>
    </div>
  )
}

export function LibraryUpdatedValue({
  mtime,
  className,
}: {
  mtime: number
  className?: string
}) {
  return (
    <div className={cn('shrink-0', className)}>
      <div className={cn(updatedGrid, 'text-right')}>
        <div
          className="hidden sm:block text-xs font-medium text-muted-foreground tabular-nums"
          title={mtime > 0 ? new Date(mtime).toLocaleString() : undefined}
        >
          {formatLastUpdated(mtime)}
        </div>
      </div>
    </div>
  )
}
