import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import {
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import type { CatalogProject } from '@/data/projects'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

export const ProjectLink = forwardRef<
  HTMLAnchorElement,
  {
    project: CatalogProject
    children: ReactNode
    source?: boolean
  } & Omit<ComponentPropsWithoutRef<'a'>, 'href'>
>(function ProjectLink(
  { project, source, className, children, ...props },
  ref,
) {
  if (project.to === '/repos/$repo' && project.repo) {
    return (
      <Link
        ref={ref}
        to="/repos/$repo"
        params={{ repo: project.repo }}
        search={{
          file: undefined,
          path: undefined,
          source: source ? true : undefined,
        }}
        className={className}
        {...props}
      >
        {children}
      </Link>
    )
  }

  if (project.to === '/discord-themes') {
    return (
      <Link
        ref={ref}
        to="/discord-themes"
        search={{ file: undefined }}
        className={className}
        {...props}
      >
        {children}
      </Link>
    )
  }

  if (project.to === '/tampermonkey') {
    return (
      <Link
        ref={ref}
        to="/tampermonkey"
        search={{ file: undefined }}
        className={className}
        {...props}
      >
        {children}
      </Link>
    )
  }

  if (project.to === '/') {
    return (
      <Link ref={ref} to="/" className={className} {...props}>
        {children}
      </Link>
    )
  }

  const href = project.href ?? project.githubUrl
  if (!href) {
    return (
      <span ref={ref} className={className} {...props}>
        {children}
      </span>
    )
  }

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      {...props}
    >
      {children}
    </a>
  )
})

export function InstallCommand({
  command,
  className,
}: {
  command: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      toast.success('Install command copied')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Failed to copy install command')
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-10 min-w-0 items-start gap-1.5 rounded-lg border bg-code-surface py-1 pr-1 pl-3 font-mono text-xs leading-5',
        className,
      )}
    >
      <span aria-hidden="true" className="py-1.5 select-none text-brand">
        $
      </span>
      <code
        className="min-w-0 flex-1 py-1.5 whitespace-pre-wrap [overflow-wrap:anywhere] text-foreground select-all"
        aria-label="Install command"
      >
        {command}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label={copied ? 'Copied' : 'Copy install command'}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void copy()
        }}
      >
        {copied ? <Check className="text-brand" /> : <Copy />}
      </Button>
    </div>
  )
}

export function CatalogRow({
  project,
  source,
}: {
  project: CatalogProject
  source?: boolean
}) {
  const isExternal = !project.to

  return (
    <li className="flex flex-col">
      <ProjectLink
        project={project}
        source={source}
        className="group grid gap-x-4 gap-y-1 px-4 py-3.5 outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="truncate">{project.name}</span>
            {isExternal ? (
              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
            ) : null}
          </span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {project.description}
          </span>
        </span>
        <span className="flex items-center gap-4 font-mono text-xs tabular-nums text-muted-foreground">
          {project.language ? <span>{project.language}</span> : null}
          {project.updatedAt ? (
            <span>{formatRelativeTime(project.updatedAt)}</span>
          ) : null}
        </span>
      </ProjectLink>
      {project.installCommand ? (
        <div className="px-4 pb-4">
          <InstallCommand command={project.installCommand} />
        </div>
      ) : null}
    </li>
  )
}

export function CatalogSection({
  title,
  description,
  count,
  children,
  className,
}: {
  title: string
  description?: string
  count?: number
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex min-w-0 flex-col gap-3', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {typeof count === 'number' ? (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {count} {count === 1 ? 'repo' : 'repos'}
          </span>
        ) : null}
      </div>
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {children}
      </ul>
    </section>
  )
}
