import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import type { CatalogProject } from '@/data/projects'
import { languageColor } from '@/lib/languages'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function ProjectLink({
  project,
  className,
  children,
}: {
  project: CatalogProject
  className?: string
  children: ReactNode
}) {
  if (project.to === '/repos/$repo' && project.repo) {
    return (
      <Link
        to="/repos/$repo"
        params={{ repo: project.repo }}
        search={{ file: undefined, path: undefined }}
        className={className}
      >
        {children}
      </Link>
    )
  }

  if (project.to === '/discord-themes') {
    return (
      <Link to="/discord-themes" search={{ file: undefined }} className={className}>
        {children}
      </Link>
    )
  }

  if (project.to === '/tampermonkey') {
    return (
      <Link to="/tampermonkey" search={{ file: undefined }} className={className}>
        {children}
      </Link>
    )
  }

  if (project.to === '/') {
    return (
      <Link to="/" className={className}>
        {children}
      </Link>
    )
  }

  const href = project.href ?? project.githubUrl
  if (!href) return <div className={className}>{children}</div>

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  )
}

export function CatalogRow({ project }: { project: CatalogProject }) {
  const isExternal = !project.to

  return (
    <div>
      <ProjectLink project={project} className="catalog-row group">
        <span className="catalog-caret" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-sm font-medium text-foreground group-hover:text-primary">
              {project.name}
            </span>
            {isExternal ? (
              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {project.description}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          {project.language ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: languageColor(project.language) }}
              />
              {project.language}
            </span>
          ) : null}
          {project.updatedAt ? (
            <span className="w-16 text-right font-mono text-xs tabular-nums text-muted-foreground">
              {formatRelativeTime(project.updatedAt)}
            </span>
          ) : null}
        </div>
      </ProjectLink>
      {project.installCommand ? (
        <InstallCommand command={project.installCommand} />
      ) : null}
    </div>
  )
}

export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex items-stretch gap-2 border-t border-border/60 bg-muted/30 px-3 py-2 sm:px-4">
      <code className="min-w-0 flex-1 overflow-x-auto py-1 font-mono text-[12px] text-foreground">
        {command}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Copy install command"
        onClick={async (event) => {
          event.preventDefault()
          event.stopPropagation()
          await navigator.clipboard.writeText(command)
          toast.success('Install command copied')
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        }}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  )
}

export function CatalogSection({
  path,
  description,
  children,
  className,
}: {
  path: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('min-w-0', className)}>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-mono text-sm font-medium text-primary">{path}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-md border bg-card">
        <div className="divide-y divide-border/60">{children}</div>
      </div>
    </section>
  )
}
