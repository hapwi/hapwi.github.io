import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Link2 } from 'lucide-react'
import { toast } from 'sonner'

import { FileIcon } from '@/components/file-icon'
import { Button } from '@/components/ui/button'
import {
  buildHostedAssetUrl,
  getCollectionDetailLocation,
} from '@/lib/collection-links'
import type { LibraryAsset } from '@/lib/library'
import { getThemePresentation } from '@/lib/theme-presentation'
import { cn } from '@/lib/utils'

function currentOrigin() {
  return typeof window === 'undefined' ? undefined : window.location.origin
}

export async function copyHostedUrl(urlPath: string) {
  try {
    await navigator.clipboard.writeText(
      buildHostedAssetUrl(urlPath, currentOrigin()),
    )
    toast.success('Raw URL copied')
  } catch {
    toast.error('Failed to copy raw URL')
  }
}

export function ThemeSwatch({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const { palette } = getThemePresentation(name)
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 grid-cols-4 overflow-hidden rounded-md ring-1 ring-foreground/10 ring-inset',
        className,
      )}
    >
      {palette.map((color, index) => (
        <span key={index} style={{ backgroundColor: color }} />
      ))}
    </span>
  )
}

type HostedFilesPanelProps = {
  title: string
  description: string
  to: '/discord-themes' | '/tampermonkey'
  collection: 'themes' | 'scripts'
  items: LibraryAsset[]
  leading: (item: LibraryAsset) => ReactNode
}

export function HostedFilesPanel({
  title,
  description,
  to,
  collection,
  items,
  leading,
}: HostedFilesPanelProps) {
  return (
    <section
      aria-labelledby={`${collection}-heading`}
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card"
    >
      <div className="flex items-start justify-between gap-4 p-5 sm:px-6">
        <div className="min-w-0">
          <h3
            id={`${collection}-heading`}
            className="font-display text-lg font-semibold"
          >
            <Link
              to={to}
              search={{ file: undefined }}
              className="rounded-sm outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {items.length} {items.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      <ul className="divide-y border-t">
        {items.map((item) => (
          <li
            key={item.urlPath}
            className="flex items-center gap-3 px-5 py-3 sm:px-6"
          >
            {leading(item)}
            <div className="min-w-0 flex-1">
              <Link
                {...getCollectionDetailLocation(collection, item.urlPath)}
                className="block truncate text-sm font-medium outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.displayName}
              </Link>
              <span className="block truncate font-mono text-xs text-muted-foreground">
                {item.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label={`Copy raw URL for ${item.displayName}`}
              onClick={() => void copyHostedUrl(item.urlPath)}
            >
              <Link2 />
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t bg-muted/40 px-5 py-3 sm:px-6">
        <Link
          to={to}
          search={{ file: undefined }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open {title.toLowerCase()}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

export function ScriptLeading({ item }: { item: LibraryAsset }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-muted/60">
      <FileIcon filename={item.name} extension={item.extension} size="sm" />
    </span>
  )
}
