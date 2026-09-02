import { ArrowRight, Github, Star } from 'lucide-react'

import { InstallCommand, ProjectLink } from '@/components/catalog-row'
import { ProjectEmblem } from '@/components/project-emblem'
import { Button } from '@/components/ui/button'
import type { CatalogProject } from '@/data/projects'
import { formatRelativeTime } from '@/lib/format'

export function ProjectMeta({
  project,
  className,
}: {
  project: CatalogProject
  className?: string
}) {
  const items: Array<{ label: string; value: string; icon?: typeof Star }> = []
  if (project.language)
    items.push({ label: 'Language', value: project.language })
  if (typeof project.stars === 'number') {
    items.push({ label: 'Stars', value: String(project.stars), icon: Star })
  }
  if (project.updatedAt) {
    items.push({
      label: 'Updated',
      value: `Updated ${formatRelativeTime(project.updatedAt)}`,
    })
  }
  if (items.length === 0) return null

  return (
    <dl className={className}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <dt className="sr-only">{item.label}</dt>
          <dd className="flex items-center gap-1 font-mono text-xs tabular-nums text-muted-foreground">
            {item.icon ? (
              <item.icon className="size-3.5" aria-hidden="true" />
            ) : null}
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function ProjectLedgerRow({ project }: { project: CatalogProject }) {
  const githubUrl = project.githubUrl ?? project.href
  const hasOverview = Boolean(project.to || project.homepageUrl)

  return (
    <li className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-4 py-7 first:pt-0 md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-x-6 lg:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-10">
      <ProjectEmblem
        id={project.id}
        name={project.name}
        className="size-14 md:size-[4.5rem]"
        size={144}
      />

      <div className="min-w-0 self-center">
        <h3 className="font-display text-xl font-semibold tracking-[-0.02em] sm:text-[1.375rem]">
          <ProjectLink
            project={project}
            className="rounded-sm outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {project.name}
          </ProjectLink>
        </h3>
        <p className="mt-1.5 max-w-[52ch] text-[0.9375rem] leading-6 text-muted-foreground">
          {project.description}
        </p>
        <ProjectMeta
          project={project}
          className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1"
        />
      </div>

      <div className="col-span-2 flex min-w-0 flex-col gap-3 lg:col-span-1 lg:col-start-3 lg:self-center">
        {project.installCommand ? (
          <InstallCommand command={project.installCommand} />
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {hasOverview ? (
            <Button asChild size="sm" variant="outline">
              {project.homepageUrl && !project.to ? (
                <a href={project.homepageUrl} target="_blank" rel="noreferrer">
                  Overview
                  <ArrowRight data-icon="inline-end" />
                </a>
              ) : (
                <ProjectLink project={project}>
                  Overview
                  <ArrowRight data-icon="inline-end" />
                </ProjectLink>
              )}
            </Button>
          ) : null}
          {githubUrl ? (
            <Button asChild size="sm" variant="ghost">
              <a href={githubUrl} target="_blank" rel="noreferrer">
                <Github data-icon="inline-start" />
                GitHub
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  )
}

export function ProjectLedger({ projects }: { projects: CatalogProject[] }) {
  return (
    <ul className="divide-y">
      {projects.map((project) => (
        <ProjectLedgerRow key={project.id} project={project} />
      ))}
    </ul>
  )
}
