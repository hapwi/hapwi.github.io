import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
      <main className={cn(
        "mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:py-10 lg:px-8",
        className
      )}>
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
    <header className={cn("space-y-3 sm:space-y-4", className)}>
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

export function PageTitle({ icon, iconClassName, title, description }: PageTitleProps) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      {icon && (
        <div className={cn(
          "flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-lg",
          iconClassName
        )}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn("space-y-6 sm:space-y-8", className)}>
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
    <div className={cn(
      "grid gap-6 sm:gap-8 lg:grid-cols-[1fr_280px] lg:gap-10",
      className
    )}>
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
    <section className={cn("min-w-0 space-y-4 sm:space-y-5", className)}>
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
    <aside className={cn("space-y-4 sm:space-y-5 min-w-0", className)}>
      {children}
    </aside>
  )
}

interface SidebarCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'warning' | 'info'
}

export function SidebarCard({ children, className, variant = 'default' }: SidebarCardProps) {
  const variantClasses = {
    default: 'border bg-card',
    warning: 'border border-amber-500/30 bg-amber-500/5',
    info: 'border border-violet-500/30 bg-violet-500/5',
  }

  return (
    <div className={cn(
      "rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden",
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  )
}

interface SidebarCardHeaderProps {
  icon?: React.ReactNode
  title: string
  className?: string
  variant?: 'default' | 'warning' | 'info'
}

export function SidebarCardHeader({ icon, title, className, variant = 'default' }: SidebarCardHeaderProps) {
  const variantClasses = {
    default: '',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-violet-600 dark:text-violet-400',
  }

  return (
    <div className={cn("flex items-center gap-2 mb-3", className)}>
      {icon && <span className={cn("size-4 shrink-0", variant === 'default' ? 'text-muted-foreground' : variantClasses[variant])}>{icon}</span>}
      <h3 className={cn("font-display text-sm font-semibold", variantClasses[variant])}>{title}</h3>
    </div>
  )
}

interface FileListCardProps {
  children: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function FileListCard({ children, header, className }: FileListCardProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card shadow-sm", className)}>
      {header && (
        <div className="flex items-center justify-between border-b bg-muted/30 px-3 sm:px-5 py-2.5 sm:py-3">
          {header}
        </div>
      )}
      <div className="divide-y divide-border/50 editorial-stagger">
        {children}
      </div>
    </div>
  )
}

interface FileListItemProps {
  children: React.ReactNode
  className?: string
}

export function FileListItem({ children, className }: FileListItemProps) {
  return (
    <div className={cn(
      "group flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-3.5 transition-colors hover:bg-muted/50",
      className
    )}>
      {children}
    </div>
  )
}
