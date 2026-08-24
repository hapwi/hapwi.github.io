/** GitHub Linguist-adjacent colors for languages we actually ship. */
export const languageColors: Record<string, string> = {
  css: '#563d7c',
  javascript: '#f1e05a',
  typescript: '#3178c6',
  python: '#3572a5',
  'objective-c': '#438eff',
  swift: '#f05138',
  rust: '#dea584',
  zig: '#ec915c',
  html: '#e34c26',
  json: '#292929',
  markdown: '#083fa1',
  shell: '#89e051',
  go: '#00add8',
}

export function languageColor(language?: string | null) {
  if (!language) return 'var(--muted-foreground)'
  return languageColors[language.toLowerCase()] ?? 'var(--muted-foreground)'
}

const extensionLanguages: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  m: 'objective-c',
  mm: 'objective-c',
  md: 'markdown',
  mdx: 'markdown',
  yml: 'yaml',
  yaml: 'yaml',
  rs: 'rust',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  css: 'css',
  html: 'html',
  json: 'json',
  go: 'go',
  swift: 'swift',
  zig: 'zig',
}

export function highlightLanguageFromExtension(extension?: string | null) {
  if (!extension) return 'txt'
  const ext = extension.toLowerCase()
  return extensionLanguages[ext] ?? ext
}
