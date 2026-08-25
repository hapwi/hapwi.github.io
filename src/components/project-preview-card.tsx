import { ArrowUpRight, Github } from 'lucide-react'

import { InstallCommand, ProjectLink } from '@/components/catalog-row'
import { Button } from '@/components/ui/button'
import type { CatalogProject } from '@/data/projects'

export function ProjectPreviewCard({ project }: { project: CatalogProject }) {
  const githubUrl = project.githubUrl ?? project.href
  const hasProjectView = Boolean(
    project.to || project.homepageUrl || project.href,
  )

  return (
    <article className="flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
      <div>
        <h3 className="max-w-3xl font-display text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
          {project.name}
        </h3>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {project.description}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        {project.installCommand ? (
          <div className="min-w-0 max-w-2xl flex-1">
            <InstallCommand command={project.installCommand} />
          </div>
        ) : null}

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {hasProjectView ? (
            <Button asChild>
              {project.homepageUrl && !project.to ? (
                <a href={project.homepageUrl} target="_blank" rel="noreferrer">
                  View project
                  <ArrowUpRight data-icon="inline-end" />
                </a>
              ) : (
                <ProjectLink project={project}>
                  View project
                  <ArrowUpRight data-icon="inline-end" />
                </ProjectLink>
              )}
            </Button>
          ) : null}
          {githubUrl ? (
            <Button asChild variant="outline">
              <a href={githubUrl} target="_blank" rel="noreferrer">
                <Github data-icon="inline-start" />
                Source
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
