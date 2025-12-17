type AssetMetadata = {
  title?: string
  description?: string
  language?: string
  order?: number
}

type FolderMetadata = {
  title?: string
  description?: string
  href?: string
}

export const assetMetadata: Record<string, AssetMetadata> = {
  'discord/themes/custompuccin.custom.css': {
    title: 'Custom Puccin Theme',
    description:
      'Catppuccin Mocha-inspired Discord theme.',
    language: 'CSS',
    order: 2,
  },
  'discord/themes/customcharcoal.custom.css': {
    title: 'Charcoal Twilight Theme',
    description:
      'Low-contrast charcoal and blue Discord theme tailored for darker workspaces.',
    language: 'CSS',
    order: 1,
  },
  'discord/themes/equicord.theme.css': {
    title: 'Equicord Starter Theme File',
    description:
      'Use this as the theme file you add to Equicord. Interchange themes easily by updating the link. By default, it is set to the Custom Puccin theme.',
    language: 'CSS',
    order: 0,
  },
  'tampermonkey/scripts/github-repos-links.user.js': {
    title: 'GitHub Repos Quick Links',
    description:
      'Adds "repos" and "bbp repos" shortcuts to the GitHub header.',
    language: 'JavaScript',
    order: 0,
  },
}

export const folderMetadata: Record<string, FolderMetadata> = {
  discord: {
    title: 'Discord',
    description:
      'Themes and client mods that stay versioned alongside the codebase.',
    href: '/discord-themes',
  },
  'discord/themes': {
    title: 'Themes',
    description:
      'Drop-in CSS themes compatible with Vencord, Equicord, and other Discord mod loaders.',
    href: '/discord-themes',
  },
  tampermonkey: {
    title: 'Tampermonkey',
    description: 'Browser userscripts for small quality-of-life tweaks.',
    href: '/tampermonkey',
  },
  'tampermonkey/scripts': {
    title: 'Scripts',
    description: 'Installable userscripts for Tampermonkey.',
    href: '/tampermonkey',
  },
}
