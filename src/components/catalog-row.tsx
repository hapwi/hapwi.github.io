import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import {
  Children,
  Fragment,
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'

import type { CatalogProject } from '@/data/projects'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'

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

export function CatalogRow({
  project,
  source,
}: {
  project: CatalogProject
  source?: boolean
}) {
  const isExternal = !project.to

  return (
    <div className="flex flex-col gap-2">
      <Item asChild size="sm">
        <ProjectLink project={project} source={source}>
          <ItemContent>
            <ItemTitle>
              {project.name}
              {isExternal ? <ArrowUpRight /> : null}
            </ItemTitle>
            <ItemDescription>{project.description}</ItemDescription>
          </ItemContent>
          <ItemActions className="max-sm:basis-full">
            {project.updatedAt ? (
              <Badge variant="outline">
                {formatRelativeTime(project.updatedAt)}
              </Badge>
            ) : null}
          </ItemActions>
        </ProjectLink>
      </Item>
      {project.installCommand ? (
        <div className="px-4 pb-3">
          <InstallCommand command={project.installCommand} />
        </div>
      ) : null}
    </div>
  )
}

export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <InputGroup>
      <InputGroupInput
        readOnly
        value={command}
        aria-label="Install command"
        className="min-w-0 font-mono text-xs"
        onClick={(event) => {
          event.currentTarget.select()
        }}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
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
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
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
  const items = Children.toArray(children)

  return (
    <section className={cn('flex min-w-0 flex-col gap-2', className)}>
      <Item size="sm">
        <ItemContent>
          <ItemTitle>{path}</ItemTitle>
          {description ? (
            <ItemDescription>{description}</ItemDescription>
          ) : null}
        </ItemContent>
      </Item>
      <ItemGroup className="overflow-hidden rounded-md border">
        {items.map((child, index) => (
          <Fragment key={index}>
            {child}
            {index < items.length - 1 ? <ItemSeparator /> : null}
          </Fragment>
        ))}
      </ItemGroup>
    </section>
  )
}
