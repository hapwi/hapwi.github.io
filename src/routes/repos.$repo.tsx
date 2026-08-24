import { createFileRoute } from '@tanstack/react-router'

import { GitHubRepoBrowser } from '@/components/github-repo-browser'
import { isValidRepoName } from '@/data/projects'

export const Route = createFileRoute('/repos/$repo')({
  validateSearch: (search: Record<string, unknown>) => ({
    file: typeof search.file === 'string' ? search.file : undefined,
    path: typeof search.path === 'string' ? search.path : undefined,
  }),
  component: RepoRoute,
})

function RepoRoute() {
  const { repo } = Route.useParams()
  const { file, path } = Route.useSearch()

  if (!isValidRepoName(repo)) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-16">
        <h1 className="font-display text-2xl font-semibold">Unknown repository</h1>
        <p className="mt-2 text-muted-foreground">
          Repository names can only contain letters, numbers, dots, underscores, and hyphens.
        </p>
      </div>
    )
  }

  return <GitHubRepoBrowser key={repo} repo={repo} file={file} path={path} />
}
