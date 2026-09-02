export type ThemePresentation = {
  label: string
  /** [base, surface, accent, secondary] */
  palette: [string, string, string, string]
}

export function getThemePresentation(name: string): ThemePresentation {
  const normalized = name.toLowerCase()

  if (normalized.includes('puccin')) {
    return {
      label: 'Catppuccin',
      palette: ['#1e1e2e', '#313244', '#cba6f7', '#89b4fa'],
    }
  }

  if (normalized.includes('charcoal')) {
    return {
      label: 'Charcoal',
      palette: ['#17191c', '#25282d', '#8e949e', '#d7dae0'],
    }
  }

  return {
    label: 'Equicord',
    palette: ['#17192b', '#25284a', '#8b7cf6', '#67d4d0'],
  }
}
