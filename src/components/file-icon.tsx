import {
  FileCode,
  FileText,
  FileType,
  File,
  Settings,
  Image,
  FileVideo,
  FileAudio,
  Database,
  Lock,
  Package,
  Braces,
  Hash,
  Terminal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type FileIconProps = {
  filename: string
  extension?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
}

// Extension to icon and color mapping
const extensionConfig: Record<string, { icon: typeof File; color: string }> = {
  // JavaScript / TypeScript
  js: { icon: FileCode, color: 'text-yellow-500' },
  jsx: { icon: FileCode, color: 'text-yellow-500' },
  ts: { icon: FileCode, color: 'text-blue-500' },
  tsx: { icon: FileCode, color: 'text-blue-500' },
  mjs: { icon: FileCode, color: 'text-yellow-500' },
  cjs: { icon: FileCode, color: 'text-yellow-500' },

  // Styles
  css: { icon: Hash, color: 'text-purple-500' },
  scss: { icon: Hash, color: 'text-pink-500' },
  sass: { icon: Hash, color: 'text-pink-500' },
  less: { icon: Hash, color: 'text-indigo-500' },

  // Markup
  html: { icon: FileCode, color: 'text-orange-500' },
  htm: { icon: FileCode, color: 'text-orange-500' },
  xml: { icon: FileCode, color: 'text-orange-400' },
  svg: { icon: Image, color: 'text-yellow-600' },

  // Data formats
  json: { icon: Braces, color: 'text-yellow-600' },
  yaml: { icon: FileText, color: 'text-red-400' },
  yml: { icon: FileText, color: 'text-red-400' },
  toml: { icon: FileText, color: 'text-gray-500' },

  // Documentation
  md: { icon: FileText, color: 'text-blue-400' },
  mdx: { icon: FileText, color: 'text-blue-400' },
  txt: { icon: FileText, color: 'text-gray-400' },

  // Config files
  env: { icon: Lock, color: 'text-yellow-600' },
  gitignore: { icon: Settings, color: 'text-gray-500' },
  eslintrc: { icon: Settings, color: 'text-purple-400' },
  prettierrc: { icon: Settings, color: 'text-pink-400' },

  // Shell / Scripts
  sh: { icon: Terminal, color: 'text-green-500' },
  bash: { icon: Terminal, color: 'text-green-500' },
  zsh: { icon: Terminal, color: 'text-green-500' },
  ps1: { icon: Terminal, color: 'text-blue-400' },

  // Languages
  py: { icon: FileCode, color: 'text-blue-500' },
  rb: { icon: FileCode, color: 'text-red-500' },
  go: { icon: FileCode, color: 'text-cyan-500' },
  rs: { icon: FileCode, color: 'text-orange-600' },
  java: { icon: FileCode, color: 'text-red-400' },
  kt: { icon: FileCode, color: 'text-purple-500' },
  swift: { icon: FileCode, color: 'text-orange-500' },
  c: { icon: FileCode, color: 'text-blue-400' },
  cpp: { icon: FileCode, color: 'text-blue-500' },
  h: { icon: FileCode, color: 'text-purple-400' },
  hpp: { icon: FileCode, color: 'text-purple-500' },

  // Package managers
  lock: { icon: Lock, color: 'text-gray-500' },

  // Images
  png: { icon: Image, color: 'text-purple-400' },
  jpg: { icon: Image, color: 'text-purple-400' },
  jpeg: { icon: Image, color: 'text-purple-400' },
  gif: { icon: Image, color: 'text-purple-400' },
  webp: { icon: Image, color: 'text-purple-400' },
  ico: { icon: Image, color: 'text-purple-400' },

  // Video
  mp4: { icon: FileVideo, color: 'text-red-400' },
  webm: { icon: FileVideo, color: 'text-red-400' },
  mov: { icon: FileVideo, color: 'text-red-400' },

  // Audio
  mp3: { icon: FileAudio, color: 'text-green-400' },
  wav: { icon: FileAudio, color: 'text-green-400' },
  ogg: { icon: FileAudio, color: 'text-green-400' },

  // Database
  sql: { icon: Database, color: 'text-blue-400' },
  db: { icon: Database, color: 'text-gray-500' },
  sqlite: { icon: Database, color: 'text-blue-300' },

  // Archives
  zip: { icon: Package, color: 'text-yellow-500' },
  tar: { icon: Package, color: 'text-yellow-500' },
  gz: { icon: Package, color: 'text-yellow-500' },
  rar: { icon: Package, color: 'text-yellow-500' },

  // Fonts
  woff: { icon: FileType, color: 'text-gray-400' },
  woff2: { icon: FileType, color: 'text-gray-400' },
  ttf: { icon: FileType, color: 'text-gray-400' },
  otf: { icon: FileType, color: 'text-gray-400' },
  eot: { icon: FileType, color: 'text-gray-400' },
}

// Special filename patterns
const filenameConfig: Record<string, { icon: typeof File; color: string }> = {
  'package.json': { icon: Package, color: 'text-green-500' },
  'package-lock.json': { icon: Lock, color: 'text-yellow-600' },
  'bun.lockb': { icon: Lock, color: 'text-yellow-600' },
  'yarn.lock': { icon: Lock, color: 'text-blue-400' },
  'pnpm-lock.yaml': { icon: Lock, color: 'text-orange-400' },
  'tsconfig.json': { icon: Settings, color: 'text-blue-500' },
  'vite.config.ts': { icon: Settings, color: 'text-purple-500' },
  'vite.config.js': { icon: Settings, color: 'text-purple-500' },
  '.gitignore': { icon: Settings, color: 'text-orange-400' },
  '.env': { icon: Lock, color: 'text-yellow-600' },
  '.env.local': { icon: Lock, color: 'text-yellow-600' },
  '.env.example': { icon: Lock, color: 'text-yellow-600' },
  'readme.md': { icon: FileText, color: 'text-blue-500' },
  'README.md': { icon: FileText, color: 'text-blue-500' },
  'license': { icon: FileText, color: 'text-yellow-500' },
  'LICENSE': { icon: FileText, color: 'text-yellow-500' },
}

export function FileIcon({ filename, extension, className, size = 'md' }: FileIconProps) {
  const lowerFilename = filename.toLowerCase()
  const ext = extension?.toLowerCase() || filename.split('.').pop()?.toLowerCase() || ''

  // Check for special filename first
  const filenameMatch = filenameConfig[filename] || filenameConfig[lowerFilename]
  if (filenameMatch) {
    const Icon = filenameMatch.icon
    return <Icon className={cn(sizeClasses[size], filenameMatch.color, className)} />
  }

  // Check for extension
  const extMatch = extensionConfig[ext]
  if (extMatch) {
    const Icon = extMatch.icon
    return <Icon className={cn(sizeClasses[size], extMatch.color, className)} />
  }

  // Check for user script pattern
  if (filename.endsWith('.user.js')) {
    return <Terminal className={cn(sizeClasses[size], 'text-amber-500', className)} />
  }

  // Default file icon
  return <File className={cn(sizeClasses[size], 'text-gray-400', className)} />
}

export function getFileIconColor(filename: string, extension?: string): string {
  const lowerFilename = filename.toLowerCase()
  const ext = extension?.toLowerCase() || filename.split('.').pop()?.toLowerCase() || ''

  const filenameMatch = filenameConfig[filename] || filenameConfig[lowerFilename]
  if (filenameMatch) {
    return filenameMatch.color
  }

  const extMatch = extensionConfig[ext]
  if (extMatch) {
    return extMatch.color
  }

  if (filename.endsWith('.user.js')) {
    return 'text-amber-500'
  }

  return 'text-gray-400'
}
