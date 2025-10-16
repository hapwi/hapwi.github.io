declare module 'virtual:code-library' {
  export type CodeLibraryManifestEntry = {
    name: string
    relativePath: string
    urlPath: string
    segments: string[]
    extension: string
    size: number
    mtime: number
  }

  const manifest: CodeLibraryManifestEntry[]
  export default manifest
}
