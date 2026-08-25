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
          <Alert className="my-4">
            <AlertCircle />
            <AlertTitle>GitHub is rate-limited or unreachable</AlertTitle>
            <AlertDescription>
              Showing the curated list. Star counts return when the API
              responds.
            </AlertDescription>
          </Alert>
        ) : null}

        <section aria-label="Projects">
          {workProjects.length > 0 ? (
            <div className="grid gap-5 py-5">
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
