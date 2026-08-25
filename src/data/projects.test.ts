import { describe, expect, it } from 'vite-plus/test'

import { curatedProjects, getWorkProjects } from '@/data/projects'

describe('getWorkProjects', () => {
  it('excludes hosted Themes and Scripts from Work', () => {
    const projects = getWorkProjects(curatedProjects)
    const ids = projects.map((project) => project.id)

    expect(ids).not.toContain('discord-themes')
    expect(ids).not.toContain('tampermonkey')
    expect(ids).toEqual(['period-space', 'mmf-golden-gate-fixer', 'hapcord'])
  })
})
