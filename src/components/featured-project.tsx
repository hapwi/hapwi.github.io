import { ArrowRight, Github } from 'lucide-react'

import { InstallCommand, ProjectLink } from '@/components/catalog-row'
import { ProjectEmblem } from '@/components/project-emblem'
import { ProjectMeta } from '@/components/project-ledger'
import { Button } from '@/components/ui/button'
import type { CatalogProject } from '@/data/projects'
import { getProjectArtwork } from '@/lib/project-artwork'

/** Most recently updated project, preferring ones curated as `featured`. */
export function pickFeaturedProject(projects: CatalogProject[]) {
  if (projects.length === 0) return null
  return [...projects].sort((a, b) => {
    if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1
    return (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
  })[0]!
}

export function FeaturedProject({ project }: { project: CatalogProject }) {
  const githubUrl = project.githubUrl ?? project.href
  const artwork = getProjectArtwork(project.id)

  return (
    <section
      aria-labelledby="featured-heading"
      className="grid overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_20px_48px_-28px_rgb(0_0_0/0.3)] sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] dark:shadow-none dark:ring-1 dark:ring-white/[0.04] dark:ring-inset"
    >
      <ProjectLink
        project={project}
        aria-label={`${project.name} overview`}
        className="relative block aspect-[16/10] border-b bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:aspect-auto sm:min-h-[14rem] sm:border-r sm:border-b-0"
      >
        {artwork ? (
          <img
            src={artwork}
            alt=""
            width="800"
            height="800"
            loading="eager"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center">
            <ProjectEmblem
              id={project.id}
              name={project.name}
              className="size-24"
            />
          </span>
        )}
      </ProjectLink>

      <div className="flex min-w-0 flex-col">
        <div className="flex-1 p-5 sm:p-6">
          <h2
            id="featured-heading"
            className="font-display text-[1.375rem] font-semibold tracking-[-0.025em] sm:text-2xl"
          >
            <ProjectLink
              project={project}
              className="rounded-sm outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {project.name}
            </ProjectLink>
          </h2>
          <p className="mt-2 max-w-[44ch] text-[0.9375rem] leading-6 text-muted-foreground">
            {project.description}
          </p>
          <ProjectMeta
            project={project}
            className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1"
          />
        </div>

        {project.installCommand ? (
          <div className="border-t px-5 py-4 sm:px-6">
            <InstallCommand command={project.installCommand} />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-t bg-muted/40 px-5 py-3.5 sm:px-6">
          <Button asChild size="sm">
            <ProjectLink project={project}>
              Project overview
              <ArrowRight data-icon="inline-end" />
            </ProjectLink>
          </Button>
          {githubUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={githubUrl} target="_blank" rel="noreferrer">
                <Github data-icon="inline-start" />
                GitHub
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
