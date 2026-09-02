import { Link, createFileRoute } from '@tanstack/react-router'
import { AlertCircle, ArrowRight, FolderGit2, Github } from 'lucide-react'

import {
  FeaturedProject,
  pickFeaturedProject,
} from '@/components/featured-project'
import {
  HostedFilesPanel,
  ScriptLeading,
  ThemeSwatch,
} from '@/components/hosted-files'
import { ProjectLedger } from '@/components/project-ledger'
import { SiteFooter } from '@/components/site-footer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
import { folderGroups } from '@/lib/library'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function findAssets(folderId: string, subfolderId: string) {
  const folder = folderGroups.find((entry) => entry.id === folderId)
  const subfolder =
    folder?.subfolders.find((entry) => entry.id === subfolderId) ??
    folder?.subfolders[0]
  return subfolder?.items ?? []
}

function HomeRoute() {
  const { projects, error } = useCatalog()
  const workProjects = getWorkProjects(projects)
  const featured = pickFeaturedProject(workProjects)
  const themes = findAssets('discord', 'discord/themes')
  const scripts = findAssets('tampermonkey', 'tampermonkey/scripts')

  return (
    <>
      <main className="flex-1">
        <section className="border-b">
          <div className="site-container grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:items-center lg:gap-16 lg:py-20">
            <div className="max-w-2xl">
              <h1 className="font-display text-[2.375rem] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-5xl lg:text-[3.5rem]">
                Small, sharp tools for working across macOS and Linux.
              </h1>
              <p className="mt-6 max-w-[56ch] text-lg leading-8 text-muted-foreground">
                Open-source utilities by hapwi: keyboard behavior, clipboard
                sync, and fixes for the gaps between systems. Each tool installs
                with one command, and the Discord themes and userscripts hosted
                here load straight from a raw URL.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to="/repos">
                    Browse repositories
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a
                    href={`https://github.com/${GITHUB_OWNER}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github data-icon="inline-start" />
                    github.com/{GITHUB_OWNER}
                  </a>
                </Button>
              </div>
            </div>

            {featured ? <FeaturedProject project={featured} /> : null}
          </div>
        </section>

        {error ? (
          <div className="site-container pt-8">
            <Alert>
              <AlertCircle />
              <AlertTitle>GitHub is rate-limited or unreachable</AlertTitle>
              <AlertDescription>
                Showing the curated list. Star counts and update times return
                when the API responds.
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        <section
          className="site-container py-14 sm:py-16"
          aria-labelledby="work-heading"
        >
          <div className="mb-8 flex items-end justify-between gap-4 border-b pb-4">
            <div>
              <h2
                id="work-heading"
                className="font-display text-2xl font-semibold tracking-[-0.025em] sm:text-3xl"
              >
                Work
              </h2>
              <p className="mt-1 text-muted-foreground">
                Tools I build and maintain. Source, installers, and READMEs all
                live here.
              </p>
            </div>
            {workProjects.length > 0 ? (
              <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                {workProjects.length}{' '}
                {workProjects.length === 1 ? 'project' : 'projects'}
              </span>
            ) : null}
          </div>

          {workProjects.length > 0 ? (
            <ProjectLedger projects={workProjects} />
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

        <section
          className="border-t bg-muted/30"
          aria-labelledby="hosted-heading"
        >
          <div className="site-container py-14 sm:py-16">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="hosted-heading"
                  className="font-display text-2xl font-semibold tracking-[-0.025em] sm:text-3xl"
                >
                  Hosted files
                </h2>
                <p className="mt-1 max-w-[60ch] text-muted-foreground">
                  Raw files this site serves directly. Copy a URL into your
                  client and it stays current with the repository.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <HostedFilesPanel
                title="Discord themes"
                description="CSS for Vencord, Equicord, and other client mods."
                to="/discord-themes"
                collection="themes"
                items={themes}
                leading={(item) => (
                  <ThemeSwatch name={item.name} className="h-8 w-12" />
                )}
              />
              <HostedFilesPanel
                title="Userscripts"
                description="Tampermonkey scripts for small browsing fixes."
                to="/tampermonkey"
                collection="scripts"
                items={scripts}
                leading={(item) => <ScriptLeading item={item} />}
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
