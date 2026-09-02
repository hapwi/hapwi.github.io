const projectArtwork: Record<string, string> = {
  'period-space': '/project-emblems/period-space.webp',
  pastebridge: '/project-emblems/pastebridge.webp',
  'mmf-golden-gate-fixer': '/project-emblems/mmf-golden-gate-fixer.webp',
}

/** Returns the emblem for a project, or `undefined` when none has been drawn yet. */
export function getProjectArtwork(id: string): string | undefined {
  return projectArtwork[id]
}
