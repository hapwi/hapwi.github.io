import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
      <main
        className={cn(
          'mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-14',
          className,
        )}
      >
        {children}
      </main>
    </div>
  )
}

interface PageHeaderProps {
  children: React.ReactNode
  className?: string
}

export function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b border-border/70 pb-5 sm:gap-4 sm:pb-6',
        className,
      )}
    >
      {children}
    </header>
  )
}

interface PageTitleProps {
  icon?: React.ReactNode
  iconClassName?: string
  title: string
  description?: string
}

export function PageTitle({
  icon,
  iconClassName,
  title,
  description,
}: PageTitleProps) {
  return (
    <div className="flex items-start gap-4 sm:gap-5">
      {icon && (
        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-2xl sm:size-14',
            iconClassName,
          )}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

interface PageHeroProps {
  label?: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHero({
  label,
  title,
  description,
  actions,
  className,
}: PageHeroProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between sm:pb-8',
        className,
      )}
    >
      <div className="min-w-0">
        {label ? (
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-primary">
            {label}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0">{actions}</div> : null}
    </header>
  )
}

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn('flex flex-col gap-6 sm:gap-8', className)}>
      {children}
    </div>
  )
}

interface PageGridProps {
  children: React.ReactNode
  className?: string
}

export function PageGrid({ children, className }: PageGridProps) {
  return (
    <div
      className={cn(
        'grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface PageMainProps {
  children: React.ReactNode
  className?: string
}

export function PageMain({ children, className }: PageMainProps) {
  return (
    <section className={cn('flex min-w-0 flex-col gap-4 sm:gap-5', className)}>
      {children}
    </section>
  )
}

interface PageSidebarProps {
  children: React.ReactNode
  className?: string
}

export function PageSidebar({ children, className }: PageSidebarProps) {
  return (
    <aside className={cn('flex min-w-0 flex-col gap-4 sm:gap-5', className)}>
      {children}
    </aside>
  )
}

interface SidebarCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'warning' | 'info'
}

export function SidebarCard({
  children,
  className,
  variant = 'default',
}: SidebarCardProps) {
  const variantClasses = {
    default: '',
    warning: 'border border-destructive/25 bg-destructive/5',
    info: 'border border-primary/25 bg-primary/5',
  }

  return (
    <Card className={cn('gap-0 p-5', variantClasses[variant], className)}>
      {children}
    </Card>
  )
}

interface SidebarCardHeaderProps {
  icon?: React.ReactNode
  title: string
  className?: string
  variant?: 'default' | 'warning' | 'info'
}

export function SidebarCardHeader({
  icon,
  title,
  className,
  variant = 'default',
}: SidebarCardHeaderProps) {
  const variantClasses = {
    default: '',
    warning: 'text-destructive',
    info: 'text-primary',
  }

  return (
    <div className={cn('flex items-center gap-2 mb-3', className)}>
      {icon && (
        <span
          className={cn(
            'size-4 shrink-0',
            variant === 'default'
              ? 'text-muted-foreground'
              : variantClasses[variant],
          )}
        >
          {icon}
        </span>
      )}
      <h3
        className={cn(
          'font-display text-sm font-semibold',
          variantClasses[variant],
        )}
      >
        {title}
      </h3>
    </div>
  )
}

interface FileListCardProps {
  children: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function FileListCard({
  children,
  header,
  className,
}: FileListCardProps) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      {header && (
        <div className="flex items-center justify-between border-b bg-muted/30 px-3 sm:px-5 py-2.5 sm:py-3">
          {header}
        </div>
      )}
      <div className="divide-y divide-border/50 editorial-stagger">
        {children}
      </div>
    </Card>
  )
}

interface FileListItemProps {
  children: React.ReactNode
  className?: string
}

export function FileListItem({ children, className }: FileListItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-3.5 transition-colors hover:bg-muted/50',
        className,
      )}
    >
      {children}
    </div>
  )
}
