import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

type CollectionDetailShellProps = {
  backTo: '/discord-themes' | '/tampermonkey'
  collectionLabel: string
  fileName: string
  fileMeta?: string
  fileIcon: ReactNode
  actions: ReactNode
  children: ReactNode
}

export function CollectionDetailShell({
  backTo,
  collectionLabel,
  fileName,
  fileMeta,
  fileIcon,
  actions,
  children,
}: CollectionDetailShellProps) {
  return (
    <main className="site-container flex h-[calc(100dvh-3.5rem-3.75rem-env(safe-area-inset-bottom,0px))] min-h-[34rem] flex-col gap-4 py-5 md:h-[calc(100dvh-3.5rem)] sm:py-6">
      <nav aria-label="Breadcrumb" className="flex items-center">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link to={backTo} search={{ file: undefined }}>
            <ArrowLeft data-icon="inline-start" />
            {collectionLabel}
          </Link>
        </Button>
      </nav>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-muted/40 px-4 py-2.5 sm:flex-nowrap sm:px-5">
          {fileIcon}
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-mono text-sm font-medium">
              {fileName}
            </h1>
            {fileMeta ? (
              <p className="truncate font-mono text-xs tabular-nums text-muted-foreground">
                {fileMeta}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </section>
    </main>
  )
}
