import { getProjectArtwork } from '@/lib/project-artwork'
import { cn } from '@/lib/utils'

type ProjectEmblemProps = {
  id: string
  name: string
  className?: string
  /** Intrinsic pixel size hint for the image request. */
  size?: number
  loading?: 'eager' | 'lazy'
}

export function ProjectEmblem({
  id,
  name,
  className,
  size = 160,
  loading = 'lazy',
}: ProjectEmblemProps) {
  const src = getProjectArtwork(id)

  if (!src) {
    return (
      <div
        className={cn(
          'emblem-tile grid place-items-center font-mono text-lg font-medium text-muted-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {name.slice(0, 1).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={cn('emblem-tile', className)}>
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading={loading}
        decoding="async"
      />
    </div>
  )
}
