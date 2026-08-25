import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, FolderGit2 } from 'lucide-react'

import { ProjectPreviewCard } from '@/components/project-preview-card'
import { StarOnGitHub } from '@/components/star-on-github'
import { PageContent, PageLayout } from '@/components/page-layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { useCatalog } from '@/hooks/use-catalog'
import { GITHUB_OWNER } from '@/lib/github'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function HomeRoute() {
  const { projects, error } = useCatalog()

  return (
    <PageLayout>
      <PageContent className="flex flex-col gap-10 space-y-0 sm:space-y-0">
        <Item variant="outline">
          <ItemMedia>
            <Avatar className="size-12 rounded-md">
              <AvatarImage
                src={`https://github.com/${GITHUB_OWNER}.png?size=96`}
                alt=""
              />
              <AvatarFallback className="rounded-md">ha</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>hapwi</ItemTitle>
            <ItemDescription>
              Linux, macOS, and Discord tools I actually run. Source lives on
              GitHub.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <StarOnGitHub href={`https://github.com/${GITHUB_OWNER}`} />
          </ItemActions>
        </Item>

        {error ? (
          <Alert>
            <AlertCircle />
            <AlertTitle>GitHub is rate-limited or unreachable</AlertTitle>
            <AlertDescription>
              Showing the curated list. Star counts return when the API responds.
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Projects
          </h2>
          {projects.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {projects.map((project) => (
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

      <Separator className="mt-10" />
      <Item size="sm">
        <ItemContent>
          <ItemTitle>
            {GITHUB_OWNER}/github.io
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          <Button asChild variant="link" size="sm">
            <a
              href={`https://github.com/${GITHUB_OWNER}`}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </Button>
        </ItemActions>
      </Item>
    </PageLayout>
  )
}
