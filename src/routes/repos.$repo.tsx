import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { GitHubRepoBrowser } from '@/components/github-repo-browser'
import { Button } from '@/components/ui/button'
import { isValidRepoName } from '@/data/projects'

export const Route = createFileRoute('/repos/$repo')({
  validateSearch: (search: Record<string, unknown>) => ({
    file: typeof search.file === 'string' ? search.file : undefined,
    path: typeof search.path === 'string' ? search.path : undefined,
    source:
      search.source === true || search.source === 'true' ? true : undefined,
  }),
  component: RepoRoute,
})

function RepoRoute() {
  const { repo } = Route.useParams()
  const { file, path, source } = Route.useSearch()

  if (!isValidRepoName(repo)) {
    return (
      <main className="site-container flex-1 py-16">
        <div className="max-w-xl">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em]">
            Unknown repository
          </h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            Repository names can only contain letters, numbers, dots,
            underscores, and hyphens.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/repos">
              <ArrowLeft data-icon="inline-start" />
              All repositories
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <GitHubRepoBrowser
      key={repo}
      repo={repo}
      file={file}
      path={path}
      source={source}
    />
  )
}
