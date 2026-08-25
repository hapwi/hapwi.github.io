import { describe, expect, it } from 'vite-plus/test'

import {
  buildFetchAssetUrl,
  buildHostedAssetUrl,
  getCollectionDetailLocation,
  USERSCRIPT_SOURCE_URL,
} from '@/lib/collection-links'

describe('collection links', () => {
  it('constructs theme and script detail locations', () => {
    expect(
      getCollectionDetailLocation(
        'themes',
        '/discord/themes/equicord.theme.css',
      ),
    ).toEqual({
      to: '/discord-themes',
      search: { file: '/discord/themes/equicord.theme.css' },
    })
    expect(
      getCollectionDetailLocation(
        'scripts',
        '/tampermonkey/scripts/github-repos-links.user.js',
      ),
    ).toEqual({
      to: '/tampermonkey',
      search: {
        file: '/tampermonkey/scripts/github-repos-links.user.js',
      },
    })
  })

  it('generates production copy and install targets during local development', () => {
    expect(
      buildHostedAssetUrl(
        '/discord/themes/equicord.theme.css',
        'http://localhost:3000',
      ),
    ).toBe('https://hapwi.github.io/discord/themes/equicord.theme.css')
    expect(
      buildHostedAssetUrl(
        '/tampermonkey/scripts/github-repos-links.user.js',
        'http://127.0.0.1:3000',
      ),
    ).toBe(
      'https://hapwi.github.io/tampermonkey/scripts/github-repos-links.user.js',
    )
    expect(USERSCRIPT_SOURCE_URL).toBe(
      'https://github.com/hapwi/custom-scripts',
    )
  })

  it('fetches local source from the current origin', () => {
    expect(
      buildFetchAssetUrl(
        '/tampermonkey/scripts/github-repos-links.user.js',
        'http://localhost:3000',
      ),
    ).toBe(
      'http://localhost:3000/tampermonkey/scripts/github-repos-links.user.js',
    )
  })
})
