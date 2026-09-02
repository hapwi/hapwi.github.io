import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

import { CatalogRow, CatalogSection } from '@/components/catalog-row'
import { PageContent, PageHeader, PageLayout } from '@/components/page-layout'
import { SiteFooter } from '@/components/site-footer'
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
    <>
      <PageLayout>
        <PageContent>
          <PageHeader
            title="Repositories"
            description="Public hapwi source you can read without leaving this site. File trees and READMEs are fetched from GitHub and cached in your browser."
            aside={
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {browseable.length}{' '}
                {browseable.length === 1 ? 'repository' : 'repositories'}
              </span>
            }
          />

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
                title={group.title}
                description={group.description}
                count={items.length}
              >
                {items.map((project) => (
                  <CatalogRow key={project.id} project={project} source />
                ))}
              </CatalogSection>
            ))}
          </div>
        </PageContent>
      </PageLayout>
      <SiteFooter />
    </>
  )
}
