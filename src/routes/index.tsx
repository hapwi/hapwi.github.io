import { Link, createFileRoute } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

import { ProjectPreviewCard } from '@/components/project-preview-card'
import { StarOnGitHub } from '@/components/star-on-github'
import { PageContent, PageLayout } from '@/components/page-layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useCatalog } from '@/hooks/use-catalog'
import { GITHUB_OWNER } from '@/lib/github'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function HomeRoute() {
  const { projects, error } = useCatalog()
  const featured = projects.filter((project) => project.featured)
  const rest = projects.filter((project) => !project.featured)

  return (
    <PageLayout>
      <PageContent className="flex flex-col gap-12 space-y-0 sm:gap-16 sm:space-y-0">
        <section className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-lg sm:size-20">
                <AvatarImage
                  src={`https://github.com/${GITHUB_OWNER}.png?size=160`}
                  alt=""
                />
                <AvatarFallback className="rounded-lg font-mono text-lg">
                  ha
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  hapwi
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                  Linux, macOS, and Discord tools I actually run.
                </p>
              </div>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              This site is the public shelf for the open-source work I choose to
              publish. Each card is a preview of a project. Source, issues, and
              stars live on GitHub.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <StarOnGitHub href={`https://github.com/${GITHUB_OWNER}`} />
              <Link
                to="/repos"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Browse source in this site
              </Link>
            </div>
          </div>
          {featured[0] ? (
            <ProjectPreviewCard project={featured[0]} featured />
          ) : null}
        </section>

        {error ? (
          <Alert>
            <AlertCircle />
            <AlertTitle>GitHub is rate-limited or unreachable</AlertTitle>
            <AlertDescription>
              Showing the curated list. Star counts and fresh descriptions return
              when the API responds.
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Work
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Discord CSS and Tampermonkey scripts stay hosted here. Everything
              else opens as source, or on GitHub when the tree is too large to
              browse.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.slice(1).map((project) => (
              <ProjectPreviewCard
                key={project.id}
                project={project}
                featured
              />
            ))}
            {rest.map((project) => (
              <ProjectPreviewCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      </PageContent>

      <Separator className="mt-12 sm:mt-16" />
      <footer className="flex flex-col items-start justify-between gap-3 py-6 sm:flex-row sm:items-center">
        <p className="font-mono text-sm text-muted-foreground">
          <span className="text-foreground">{GITHUB_OWNER}</span>
          /github.io
        </p>
        <a
          href={`https://github.com/${GITHUB_OWNER}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          GitHub
        </a>
      </footer>
    </PageLayout>
  )
}
