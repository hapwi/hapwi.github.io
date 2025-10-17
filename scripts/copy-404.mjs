import { access, copyFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { resolve } from 'node:path'

const distDir = resolve(process.cwd(), 'dist')
const indexHtmlPath = resolve(distDir, 'index.html')
const notFoundHtmlPath = resolve(distDir, '404.html')

async function main() {
  try {
    await access(indexHtmlPath, constants.F_OK)
  } catch {
    console.warn(
      '[copy-404] Skipping 404.html generation because dist/index.html is missing.',
    )
    return
  }

  await copyFile(indexHtmlPath, notFoundHtmlPath)
  console.log('[copy-404] Copied dist/index.html to dist/404.html')
}

main().catch((error) => {
  console.error('[copy-404] Failed to create dist/404.html', error)
  process.exitCode = 1
})
