export const PRODUCTION_ORIGIN = 'https://hapwi.github.io'
export const USERSCRIPT_SOURCE_URL = 'https://github.com/hapwi/custom-scripts'

type CollectionKind = 'themes' | 'scripts'

export function getCollectionDetailLocation(
  collection: CollectionKind,
  file: string,
) {
  return {
    to:
      collection === 'themes'
        ? ('/discord-themes' as const)
        : ('/tampermonkey' as const),
    search: { file },
  }
}

export function buildHostedAssetUrl(
  relativePath: string,
  currentOrigin?: string,
) {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  const origin =
    currentOrigin &&
    !currentOrigin.includes('localhost') &&
    !currentOrigin.includes('127.0.0.1')
      ? currentOrigin
      : PRODUCTION_ORIGIN

  return new URL(path, origin).toString()
}

export function buildFetchAssetUrl(
  relativePath: string,
  currentOrigin?: string,
) {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  return new URL(path, currentOrigin ?? PRODUCTION_ORIGIN).toString()
}
