import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, FolderGit2 } from 'lucide-react'

import { ProjectPreviewCard } from '@/components/project-preview-card'
import { StarOnGitHub } from '@/components/star-on-github'
import { PageContent, PageHero, PageLayout } from '@/components/page-layout'
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
import { GITHUB_OWNER } from '@/lib/github'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function HomeRoute() {
  const { projects, error } = useCatalog()
  const workProjects = getWorkProjects(projects)

  return (
    <PageLayout>
      <PageContent>
        <PageHero
          label="Open-source portfolio"
          title="Tools, themes, and source."
          description="A working collection of Linux, macOS, browser, and Discord projects. Everything here links back to its source."
          actions={
            <StarOnGitHub
              className="max-sm:w-full"
              href={`https://github.com/${GITHUB_OWNER}`}
            />
          }
        />

        {error ? (
          <Alert>
            <AlertCircle />
            <AlertTitle>GitHub is rate-limited or unreachable</AlertTitle>
            <AlertDescription>
              Showing the curated list. Star counts return when the API
              responds.
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Selected work
            </h2>
            <p className="mt-1 text-base text-muted-foreground">
              Explore each project or go directly to its source.
            </p>
          </div>
          {workProjects.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
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
