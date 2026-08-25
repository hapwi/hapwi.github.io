import { describe, expect, it } from 'vite-plus/test'

import { curatedProjects, getWorkProjects } from '@/data/projects'

describe('getWorkProjects', () => {
  it('excludes hosted Themes and Scripts from Work', () => {
    const projects = getWorkProjects(curatedProjects)
    const ids = projects.map((project) => project.id)

    expect(ids).not.toContain('discord-themes')
    expect(ids).not.toContain('tampermonkey')
    expect(ids).toEqual([
      'period-space',
      'pastebridge',
      'mmf-golden-gate-fixer',
      'hapcord',
    ])
  })

  it('includes Pastebridge with its verified project actions', () => {
    const pastebridge = getWorkProjects(curatedProjects).find(
      (project) => project.id === 'pastebridge',
    )

    expect(pastebridge).toMatchObject({
      name: 'Pastebridge',
      language: 'Rust',
      to: '/repos/$repo',
      repo: 'pastebridge',
      githubUrl: 'https://github.com/hapwi/pastebridge',
      installCommand:
        'curl -fsSL https://hapwi.github.io/install/pastebridge.sh | bash',
    })
  })
})
