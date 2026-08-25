import { ArrowRight, Github } from 'lucide-react'

import { InstallCommand, ProjectLink } from '@/components/catalog-row'
import { Button } from '@/components/ui/button'
import type { CatalogProject } from '@/data/projects'
import { formatRelativeTime } from '@/lib/format'

const projectArtwork = {
  'period-space': '/project-emblems/period-space.webp',
  pastebridge: '/project-emblems/pastebridge.webp',
  'mmf-golden-gate-fixer': '/project-emblems/mmf-golden-gate-fixer.webp',
} as const

function ProjectArtwork({ id }: { id: string }) {
  const src =
    projectArtwork[id as keyof typeof projectArtwork] ??
    projectArtwork['period-space']

  return (
    <img
      src={src}
      alt=""
      width="800"
      height="800"
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover"
    />
  )
}

export function ProjectPreviewCard({ project }: { project: CatalogProject }) {
  const githubUrl = project.githubUrl ?? project.href
  const hasProjectView = Boolean(
    project.to || project.homepageUrl || project.href,
  )

  return (
    <article className="group flex min-h-full flex-col overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-card shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] motion-reduce:transform-none motion-reduce:transition-none dark:border-white/[0.08] dark:shadow-none dark:hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]">
      <div className="relative h-56 overflow-hidden bg-muted sm:h-64">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transform-none">
          <ProjectArtwork id={project.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="mb-5 flex min-h-5 items-center gap-2 text-xs text-muted-foreground">
          {project.language ? <span>{project.language}</span> : null}
          {project.language && project.updatedAt ? (
            <span aria-hidden="true">·</span>
          ) : null}
          {project.updatedAt ? (
            <span>Updated {formatRelativeTime(project.updatedAt)}</span>
          ) : null}
        </div>

        <h3 className="font-display text-2xl font-semibold tracking-[-0.035em] text-balance sm:text-[1.75rem]">
          {project.name}
        </h3>
        <p className="mt-3 text-[0.9375rem] leading-6 text-muted-foreground sm:text-base">
          {project.description}
        </p>

        {project.installCommand ? (
          <div className="mt-6 min-w-0">
            <InstallCommand command={project.installCommand} />
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-7">
          {hasProjectView ? (
            <Button asChild className="rounded-full px-5">
              {project.homepageUrl && !project.to ? (
                <a href={project.homepageUrl} target="_blank" rel="noreferrer">
                  Explore project
                  <ArrowRight data-icon="inline-end" />
                </a>
              ) : (
                <ProjectLink project={project}>
                  Explore project
                  <ArrowRight data-icon="inline-end" />
                </ProjectLink>
              )}
            </Button>
          ) : null}
          {githubUrl ? (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <a href={githubUrl} target="_blank" rel="noreferrer">
                <Github />
                <span className="sr-only">View {project.name} source</span>
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
