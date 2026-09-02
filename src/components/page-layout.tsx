import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <main
      className={cn('site-container flex-1 py-8 sm:py-10 lg:py-12', className)}
    >
      {children}
    </main>
  )
}

interface PageHeaderProps {
  title: string
  description?: React.ReactNode
  /** Right-aligned metadata or actions. */
  aside?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  aside,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('border-b pb-6 sm:pb-8', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-3xl">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {children}
    </header>
  )
}

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn('flex flex-col gap-8 sm:gap-10', className)}>
      {children}
    </div>
  )
}
