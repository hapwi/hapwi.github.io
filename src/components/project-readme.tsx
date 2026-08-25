import {
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { Check, Copy } from 'lucide-react'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Skeleton } from '@/components/ui/skeleton'
import { buildRawGitHubUrl } from '@/lib/github'
import {
  readCachedFileSource,
  writeCachedFileSource,
} from '@/lib/github-browser'

type ProjectReadmeProps = {
  owner: string
  repo: string
  branch: string
  path: string
  title?: string
}

function isAbsoluteUrl(value: string) {
  return /^(?:[a-z]+:|#)/i.test(value)
}

function resolveReadmeUrl({
  value,
  owner,
  repo,
  branch,
  path,
  raw,
}: ProjectReadmeProps & { value: string; raw: boolean }) {
  if (isAbsoluteUrl(value)) return value

  const directory = path.includes('/')
    ? `${path.slice(0, path.lastIndexOf('/') + 1)}`
    : ''
  const base = raw
    ? `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${directory}`
    : `https://github.com/${owner}/${repo}/blob/${branch}/${directory}`

  return new URL(value.replace(/^\//, ''), base).toString()
}

function normalizeTitle(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function removeRepeatedTitle(source: string, title?: string) {
  if (!title) return source
  const heading = source.match(/^\s*#\s+(.+?)\s*(?:\n|$)/)
  if (!heading || normalizeTitle(heading[1] ?? '') !== normalizeTitle(title)) {
    return source
  }
  return source.slice(heading[0].length)
}

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return nodeText(node.props.children)
  }
  return ''
}

function CopyableCodeBlock({ children, ...props }: ComponentProps<'pre'>) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(nodeText(children).replace(/\n$/, ''))
      setCopied(true)
      toast.success('Code copied to clipboard')
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Failed to copy code')
    }
  }

  return (
    <div className="project-readme-code">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2"
        onClick={copyCode}
        aria-label={copied ? 'Code copied' : 'Copy code'}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
      <pre {...props}>{children}</pre>
    </div>
  )
}

export function ProjectReadme({
  owner,
  repo,
  branch,
  path,
  title,
}: ProjectReadmeProps) {
  const rawUrl = useMemo(
    () =>
      buildRawGitHubUrl({
        owner,
        repo,
        ref: branch,
        filePath: path,
      }),
    [branch, owner, path, repo],
  )
  const cached = readCachedFileSource(owner, repo, rawUrl)
  const [source, setSource] = useState<string | null>(cached?.text ?? null)
  const [isLoading, setIsLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cachedSource = readCachedFileSource(owner, repo, rawUrl)
    const controller = new AbortController()

    if (cachedSource?.text) {
      setSource(cachedSource.text)
      setIsLoading(false)
    } else {
      setSource(null)
      setIsLoading(true)
    }
    setError(null)

    async function loadReadme() {
      try {
        const response = await fetch(rawUrl, {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`GitHub returned ${response.status}`)
        }

        const text = await response.text()
        setSource(text)
        writeCachedFileSource(owner, repo, rawUrl, text)
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === 'AbortError')
          return
        if (!cachedSource?.text) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'The README could not load.',
          )
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadReadme()
    return () => controller.abort()
  }, [owner, rawUrl, repo])

  if (isLoading && !source) {
    return (
      <div className="flex flex-col gap-4" aria-label="Loading README">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-4 h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error && !source) {
    return (
      <Alert>
        <AlertTitle>README unavailable</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!source) return null

  const content = removeRepeatedTitle(source, title)

  return (
    <article className="project-readme">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          a: ({ href = '', ...props }) => (
            <a
              {...props}
              href={resolveReadmeUrl({
                owner,
                repo,
                branch,
                path,
                value: href,
                raw: false,
              })}
              target={href.startsWith('#') ? undefined : '_blank'}
              rel={href.startsWith('#') ? undefined : 'noreferrer'}
            />
          ),
          img: ({ src = '', alt = '', ...props }) => (
            <img
              {...props}
              src={resolveReadmeUrl({
                owner,
                repo,
                branch,
                path,
                value: src,
                raw: true,
              })}
              alt={alt}
              loading="lazy"
            />
          ),
          kbd: ({ children }) => <Kbd>{children}</Kbd>,
          pre: ({ children }) => (
            <CopyableCodeBlock>{children}</CopyableCodeBlock>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
