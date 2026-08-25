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

  it('includes MMF Golden Gate Fixer with its verified installer', () => {
    const mmf = getWorkProjects(curatedProjects).find(
      (project) => project.id === 'mmf-golden-gate-fixer',
    )

    expect(mmf).toMatchObject({
      name: 'MMF Golden Gate Fixer',
      language: 'Objective-C',
      to: '/repos/$repo',
      repo: 'mmf-golden-gate-fixer',
      githubUrl: 'https://github.com/hapwi/mmf-golden-gate-fixer',
      installCommand:
        'curl -fsSL https://hapwi.github.io/install/mmf-golden-gate-fixer.sh | bash',
    })
  })
})
