import { GITHUB_OWNER } from '@/lib/github'

export type ProjectGroupId = 'hosted' | 'tools' | 'source' | 'forks'

export type CatalogProject = {
  id: string
  name: string
  description: string
  group: ProjectGroupId
  language?: string
  /** Internal route path, e.g. /discord-themes or /repos/$repo */
  to?: '/discord-themes' | '/tampermonkey' | '/repos/$repo' | '/'
  repo?: string
  href?: string
  githubUrl?: string
  homepageUrl?: string
  browseable?: boolean
  /** GitHub repo name used to merge live API data */
  githubName?: string
  stars?: number
  updatedAt?: number
  installCommand?: string | null
  featured?: boolean
}

export const projectGroups: Array<{
  id: ProjectGroupId
  path: string
  title: string
  description: string
}> = [
  {
    id: 'hosted',
    path: 'hosted/',
    title: 'Hosted here',
    description:
      'Raw files this site serves so you can copy a URL into a client.',
  },
  {
    id: 'tools',
    path: 'tools/',
    title: 'Tools',
    description:
      'Original utilities for Linux, macOS, and local AI coding setup.',
  },
  {
    id: 'source',
    path: 'source/',
    title: 'Source',
    description:
      'Public repositories you can browse in this site or open on GitHub.',
  },
  {
    id: 'forks',
    path: 'forks/',
    title: 'Forks',
    description: 'Public forks kept for reference. Open them on GitHub.',
  },
]

export const curatedProjects: CatalogProject[] = [
  {
    id: 'period-space',
    name: 'period-space',
    description:
      'macOS-style double-space period on Linux: terminals, TTY, Wayland, X11, editors, browsers.',
    group: 'tools',
    language: 'Python',
    to: '/repos/$repo',
    repo: 'period-space',
    browseable: true,
    githubName: 'period-space',
    githubUrl: `https://github.com/${GITHUB_OWNER}/period-space`,
    featured: true,
  },
  {
    id: 'pastebridge',
    name: 'Pastebridge',
    description:
      'Encrypted local clipboard sync between macOS and Linux, with no cloud or account.',
    group: 'tools',
    language: 'Rust',
    to: '/repos/$repo',
    repo: 'pastebridge',
    browseable: true,
    githubName: 'pastebridge',
    githubUrl: `https://github.com/${GITHUB_OWNER}/pastebridge`,
    installCommand:
      'curl -fsSL https://hapwi.github.io/install/pastebridge.sh | bash',
    featured: true,
  },
  {
    id: 'discord-themes',
    name: 'discord/themes',
    description:
      'Catppuccin, charcoal, and Equicord starter CSS for Vencord-family clients.',
    group: 'hosted',
    language: 'CSS',
    to: '/discord-themes',
    githubName: 'discord-themes',
    githubUrl: `https://github.com/${GITHUB_OWNER}/discord-themes`,
    featured: true,
  },
  {
    id: 'tampermonkey',
    name: 'tampermonkey/scripts',
    description: 'Browser userscripts, including GitHub header shortcuts.',
    group: 'hosted',
    language: 'JavaScript',
    to: '/tampermonkey',
    githubName: 'custom-scripts',
    githubUrl: `https://github.com/${GITHUB_OWNER}/custom-scripts`,
  },
  {
    id: 'mmf-golden-gate-fixer',
    name: 'MMF Golden Gate Fixer',
    description:
      'Restores Mac Mouse Fix button-drag Spaces on macOS 27 Golden Gate.',
    group: 'tools',
    language: 'Objective-C',
    to: '/repos/$repo',
    repo: 'mmf-golden-gate-fixer',
    browseable: true,
    githubName: 'mmf-golden-gate-fixer',
    githubUrl: `https://github.com/${GITHUB_OWNER}/mmf-golden-gate-fixer`,
    installCommand:
      'curl -fsSL https://hapwi.github.io/install/mmf-golden-gate-fixer.sh | bash',
  },
]

const hostedCollectionProjectIds = new Set(['discord-themes', 'tampermonkey'])

export function getWorkProjects(projects: CatalogProject[]) {
  return projects.filter(
    (project) => !hostedCollectionProjectIds.has(project.id),
  )
}

/** Repos too large or circular to browse in the in-site tree viewer. */
export const unbrowsableRepos = new Set([
  'hapcord',
  'flux',
  'fluxx',
  'CodexBar',
  'duster',
  'hapwi.github.io',
  'devbox-test',
])

export const hiddenAutoImportRepos = new Set([
  'hapwi.github.io',
  'devbox-test',
  'bbpcn',
  'CodexBar',
  'devcloud-releases',
  'custom-scripts',
  'codex-cleaner',
  'bettergit',
])

export function isValidRepoName(name: string) {
  return /^[A-Za-z0-9._-]+$/.test(name) && name !== '.' && name !== '..'
}

export function isBrowsableRepo(name: string) {
  return isValidRepoName(name) && !unbrowsableRepos.has(name)
}

export function findCuratedProject(repo: string) {
  return curatedProjects.find(
    (project) => project.repo === repo || project.githubName === repo,
  )
}
