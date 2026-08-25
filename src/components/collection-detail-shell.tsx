import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

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
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="mx-auto flex h-[calc(100dvh-10rem-env(safe-area-inset-bottom,0px))] min-h-[34rem] w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:gap-5 sm:px-6 sm:py-7 lg:px-10">
        <header className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link to={backTo} search={{ file: undefined }}>
              <ArrowLeft data-icon="inline-start" />
              {collectionLabel}
            </Link>
          </Button>
        </header>

        <Card className="flex min-h-0 flex-1 gap-0 overflow-hidden py-0">
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-muted/35 px-4 py-3 sm:flex-nowrap sm:px-5">
            {fileIcon}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold sm:text-lg">
                {fileName}
              </h1>
              {fileMeta ? (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  {fileMeta}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">{actions}</div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </Card>
      </main>
    </div>
  )
}
