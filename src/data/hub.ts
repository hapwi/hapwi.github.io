import { hubProjects as generatedProjects, hubSyncedAt } from './hub.generated'

export type HubProject = {
  slug: string
  name: string
  tagline: string
  description: string
  repoUrl: string
  homepage: string | null
  language: string | null
  stars: number
  pushedAt: string
  topics: readonly string[]
  installUrl: string | null
  installCommand: string | null
}

export const hubProjects: HubProject[] = [...generatedProjects]
export { hubSyncedAt }
