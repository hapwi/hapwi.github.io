import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

import { CatalogRow, CatalogSection } from '@/components/catalog-row'
import { PageContent, PageHeader, PageLayout } from '@/components/page-layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { isBrowsableRepo, projectGroups } from '@/data/projects'
import { useCatalog } from '@/hooks/use-catalog'

export const Route = createFileRoute('/repos/')({
  component: ReposIndexRoute,
})

function ReposIndexRoute() {
  const { projects, error } = useCatalog()
  const browseable = projects.filter(
    (project) =>
      project.browseable && project.repo && isBrowsableRepo(project.repo),
  )

  const grouped = projectGroups
    .map((group) => ({
      group,
      items: browseable.filter((project) => project.group === group.id),
    }))
    .filter(({ items }) => items.length > 0)

  return (
    <PageLayout>
      <PageContent>
        <PageHeader>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Repositories
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Browse public hapwi source in this site. Trees are fetched from
            GitHub and cached locally.
          </p>
        </PageHeader>

        {error ? (
          <Alert>
            <AlertCircle />
            <AlertTitle>GitHub list is stale</AlertTitle>
            <AlertDescription>
              Showing curated repositories. {error}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-10">
          {grouped.map(({ group, items }) => (
            <CatalogSection
              key={group.id}
              path={group.path}
              description={group.description}
            >
              {items.map((project) => (
                <CatalogRow key={project.id} project={project} />
              ))}
            </CatalogSection>
          ))}
        </div>
      </PageContent>
    </PageLayout>
  )
}
