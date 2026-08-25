import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, FolderGit2 } from 'lucide-react'

import { ProjectPreviewCard } from '@/components/project-preview-card'
import { PageContent, PageLayout } from '@/components/page-layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { getWorkProjects } from '@/data/projects'
import { useCatalog } from '@/hooks/use-catalog'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function HomeRoute() {
  const { projects, error } = useCatalog()
  const workProjects = getWorkProjects(projects)

  return (
    <PageLayout className="py-0 sm:py-0 lg:py-0">
      <PageContent className="gap-0">
        {error ? (
          <Alert className="mt-4">
            <AlertCircle />
            <AlertTitle>GitHub is rate-limited or unreachable</AlertTitle>
            <AlertDescription>
              Showing the curated list. Star counts return when the API
              responds.
            </AlertDescription>
          </Alert>
        ) : null}

        <header className="flex min-h-[31rem] flex-col justify-center border-b border-border/60 py-20 sm:min-h-[36rem] sm:py-24 lg:min-h-[39rem]">
          <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-balance sm:text-7xl lg:text-[5.75rem]">
            Software for the spaces between systems.
          </h1>
          <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-[minmax(0,38rem)_auto] sm:items-end sm:justify-between">
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              A small collection of focused, open-source tools for making Linux,
              macOS, and the devices between them work better together.
            </p>
            <p className="text-sm leading-6 text-muted-foreground sm:text-right">
              Built in public
              <br />
              Designed for daily use
            </p>
          </div>
        </header>

        <section className="py-14 sm:py-20" aria-labelledby="work-heading">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <h2
                id="work-heading"
                className="font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"
              >
                Current work
              </h2>
              <p className="mt-2 text-muted-foreground">
                Practical projects, actively shaped and maintained.
              </p>
            </div>
            {workProjects.length > 0 ? (
              <p className="hidden text-sm text-muted-foreground sm:block">
                {workProjects.length}{' '}
                {workProjects.length === 1 ? 'project' : 'projects'}
              </p>
            ) : null}
          </div>

          {workProjects.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {workProjects.map((project) => (
                <ProjectPreviewCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderGit2 />
                </EmptyMedia>
                <EmptyTitle>No projects yet</EmptyTitle>
                <EmptyDescription>
                  Curated repositories will show up here once the catalog syncs.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </PageContent>
    </PageLayout>
  )
}
