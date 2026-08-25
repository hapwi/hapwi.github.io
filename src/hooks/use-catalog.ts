import { useEffect, useMemo, useState } from 'react'

import { curatedProjects, type CatalogProject } from '@/data/projects'
import { hubProjects } from '@/data/hub'
import {
  fetchPublicRepos,
  readCachedPublicRepos,
  type GitHubPublicRepo,
} from '@/lib/github-repos'
import { GITHUB_OWNER } from '@/lib/github'

function hubInstallCommand(project: CatalogProject) {
  const key = project.githubName ?? project.repo
  if (!key) return project.installCommand ?? null
  return hubProjects.find((item) => item.slug === key)?.installCommand ?? null
}

function mergeCatalog(remote: GitHubPublicRepo[] | null): CatalogProject[] {
  const remoteByName = new Map((remote ?? []).map((repo) => [repo.name, repo]))

  return curatedProjects.map((project) => {
    const key = project.githubName ?? project.repo
    const remoteRepo = key ? remoteByName.get(key) : undefined
    const installCommand = hubInstallCommand(project)

    if (!remoteRepo) {
      return { ...project, installCommand }
    }

    return {
      ...project,
      description: project.description || remoteRepo.description || '',
      language: project.language || remoteRepo.language || undefined,
      homepageUrl: project.homepageUrl || remoteRepo.homepage || undefined,
      githubUrl: project.githubUrl || remoteRepo.htmlUrl,
      stars: remoteRepo.stargazerCount,
      updatedAt: remoteRepo.updatedAt,
      installCommand,
    } satisfies CatalogProject
  })
}

export function useCatalog() {
  const [remote, setRemote] = useState<GitHubPublicRepo[] | null>(() =>
    readCachedPublicRepos(),
  )
  const [isLoading, setIsLoading] = useState(() => remote == null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cached = readCachedPublicRepos()
    if (cached) {
      setRemote(cached)
      setIsLoading(false)
    }

    let cancelled = false
    const controller = new AbortController()

    fetchPublicRepos({ signal: controller.signal })
      .then((repos) => {
        if (cancelled) return
        setRemote(repos)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (!cached) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load GitHub projects',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  const projects = useMemo(() => mergeCatalog(remote), [remote])

  return {
    owner: GITHUB_OWNER,
    projects,
    isLoading,
    error,
    hasRemote: remote != null,
  }
}
