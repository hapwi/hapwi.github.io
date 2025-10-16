import { readdir, stat } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'
import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

type CodeLibraryManifestEntry = {
  name: string
  relativePath: string
  urlPath: string
  segments: string[]
  extension: string
  size: number
  mtime: number
}

const virtualModuleId = 'virtual:code-library'
const resolvedVirtualModuleId = `\0${virtualModuleId}`

const hiddenEntries = new Set(['.DS_Store'])

function toPosixPath(pathString: string) {
  return pathString.split(sep).join('/')
}

async function walkPublicDir(baseDir: string, currentDir = baseDir) {
  const entries = await readdir(currentDir, { withFileTypes: true })
  const manifest: CodeLibraryManifestEntry[] = []

  for (const entry of entries) {
    if (hiddenEntries.has(entry.name) || entry.name.startsWith('.')) {
      continue
    }

    const absolutePath = join(currentDir, entry.name)

    if (entry.isDirectory()) {
      manifest.push(...(await walkPublicDir(baseDir, absolutePath)))
      continue
    }

    if (!entry.isFile()) continue

    const stats = await stat(absolutePath)
    const relativePath = toPosixPath(relative(baseDir, absolutePath))
    const segments = relativePath.split('/')
    const extension = extname(entry.name).replace('.', '').toLowerCase()

    manifest.push({
      name: entry.name,
      relativePath,
      urlPath: `/${relativePath}`,
      segments,
      extension,
      size: stats.size,
      mtime: stats.mtimeMs,
    })
  }

  return manifest
}

function codeLibraryManifestPlugin() {
  let publicDir = ''
  let cachedManifest: CodeLibraryManifestEntry[] = []

  async function regenerateManifest() {
    if (!publicDir) {
      cachedManifest = []
      return
    }

    cachedManifest = (await walkPublicDir(publicDir)).sort((a, b) =>
      a.relativePath.localeCompare(b.relativePath),
    )
  }

  return {
    name: 'code-library-manifest',
    enforce: 'pre' as const,
    configResolved(config: { publicDir: string }) {
      publicDir = config.publicDir
    },
    async buildStart() {
      await regenerateManifest()
    },
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(cachedManifest)};`
      }
    },
    async handleHotUpdate(ctx: { file: string; server: any }) {
      if (!publicDir || !ctx.file.startsWith(publicDir)) return

      await regenerateManifest()

      const module = ctx.server.moduleGraph.getModuleById(
        resolvedVirtualModuleId,
      )
      if (module) {
        ctx.server.moduleGraph.invalidateModule(module)
      }

      ctx.server.ws.send({
        type: 'full-reload',
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    codeLibraryManifestPlugin(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
