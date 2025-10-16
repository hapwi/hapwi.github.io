import codeLibraryManifest from 'virtual:code-library'

import { assetMetadata, folderMetadata } from '@/data/library-metadata'

export type CodeLibraryManifestEntry = {
  name: string
  relativePath: string
  urlPath: string
  segments: string[]
  extension: string
  size: number
  mtime: number
}

export type LibraryAsset = CodeLibraryManifestEntry & {
  displayName: string
  description: string
  language: string
  folderSegments: string[]
  order: number
}

export type LibrarySubfolder = {
  id: string
  title: string
  description?: string
  href?: string
  items: LibraryAsset[]
}

export type LibraryFolder = {
  id: string
  title: string
  description?: string
  href?: string
  totalItems: number
  subfolders: LibrarySubfolder[]
}

function buildCodeLibrary(): LibraryAsset[] {
  return codeLibraryManifest
    .map((entry) => {
      const metadata = assetMetadata[entry.relativePath] ?? {}
      const fallbackLabel = entry.extension
        ? entry.extension.toUpperCase()
        : 'FILE'

      return {
        ...entry,
        displayName: metadata.title ?? entry.name,
        description:
          metadata.description ??
          `Raw ${fallbackLabel} asset served from /${entry.relativePath}.`,
        language: metadata.language ?? fallbackLabel,
        folderSegments: entry.segments.slice(0, -1),
        order: typeof metadata.order === 'number' ? metadata.order : Number.POSITIVE_INFINITY,
      }
    })
    .filter((entry) => entry.folderSegments.length > 0)
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

function buildFolderGroups(library: LibraryAsset[]): LibraryFolder[] {
  const folderMap = new Map<
    string,
    {
      id: string
      title: string
      description?: string
      href?: string
      subfolders: Map<string, LibrarySubfolder>
    }
  >()

  for (const asset of library) {
    const hasFolder = asset.folderSegments.length > 0
    if (!hasFolder) {
      continue
    }

    const topId = asset.folderSegments[0]
    const topMeta = folderMetadata[topId] ?? {}

    let folderEntry = folderMap.get(topId)
    if (!folderEntry) {
      folderEntry = {
        id: topId,
        title: topMeta.title ?? topId,
        description: topMeta.description,
        href: topMeta.href,
        subfolders: new Map(),
      }
      folderMap.set(topId, folderEntry)
    }

    const subSegments = asset.folderSegments.slice(1)
    const subId =
      subSegments.length > 0 ? `${topId}/${subSegments.join('/')}` : topId
    const subMeta = folderMetadata[subId] ?? {}
    const fallbackTitle =
      subSegments.length > 0 ? subSegments.join(' / ') : 'Top-level files'

    let subfolderEntry = folderEntry.subfolders.get(subId)
    if (!subfolderEntry) {
      subfolderEntry = {
        id: subId,
        title: subMeta.title ?? fallbackTitle,
        description: subMeta.description,
        href: subMeta.href,
        items: [],
      }
      folderEntry.subfolders.set(subId, subfolderEntry)
    }

    subfolderEntry.items.push(asset)
  }

  return Array.from(folderMap.values())
    .map((folder) => {
      const subfolders = Array.from(folder.subfolders.values()).map(
        (subfolder) => ({
          ...subfolder,
          items: subfolder.items
            .slice()
            .sort((a, b) => {
              if (a.order !== b.order) {
                return a.order - b.order
              }
              return a.displayName.localeCompare(b.displayName)
            }),
        }),
      )

      return {
        id: folder.id,
        title: folder.title,
        description: folder.description,
        href: folder.href,
        subfolders: subfolders.sort((a, b) =>
          a.title.localeCompare(b.title),
        ),
        totalItems: subfolders.reduce(
          (total, subfolder) => total + subfolder.items.length,
          0,
        ),
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}

const libraryCache = buildCodeLibrary()
const folderGroupsCache = buildFolderGroups(libraryCache)

export const codeLibrary = libraryCache
export const folderGroups = folderGroupsCache

export function findFeaturedAsset(path: string) {
  return codeLibrary.find((asset) => asset.relativePath === path)
}
