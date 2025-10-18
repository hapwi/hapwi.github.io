import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { folderGroups } from '@/lib/library'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function HomeRoute() {
  const directories = folderGroups

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 pb-16 pt-20 sm:gap-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-24">
        <section className="space-y-6">
          <Badge
            variant="secondary"
            className="w-fit rounded-full px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] sm:text-xs sm:tracking-[0.3em]"
          >
            Hapwi HQ
          </Badge>
          <h1 className="text-pretty text-4xl font-semibold leading-tight sm:text-5xl">
            Open-source assets served straight from GitHub Pages.
          </h1>
          <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            Explore hosted directories for Discord themes and future UI kits. Each section mirrors
            the folder structure inside <code>public/</code>, so you can link to raw files or browse
            curated previews without digging through the repo.
          </p>
          <div>
            <Button asChild size="lg" className="gap-2">
              <Link to="/discord-themes">
                <span>Browse Discord themes</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">Available directories</h2>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Jump into a folder to see rendered previews and raw links for every asset currently
              published.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {directories.map((folder) => {
              const hrefCandidate =
                folder.href ?? folder.subfolders[0]?.href ?? '/discord-themes'
              const primaryHref = hrefCandidate.split('#')[0] || '/'

              return (
                <Card
                  key={folder.id}
                  className="group flex h-full flex-col border bg-card shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-xl font-semibold">
                      {folder.title}
                    </CardTitle>
                    {folder.description ? (
                      <CardDescription className="text-sm text-muted-foreground">
                        {folder.description}
                      </CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardFooter className="mt-auto pt-0">
                    <Button
                      asChild
                      variant="ghost"
                      className="group/link px-0 text-sm font-semibold text-primary"
                    >
                      <Link to={primaryHref}>
                        Open {folder.title}
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
