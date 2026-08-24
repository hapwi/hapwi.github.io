import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { GitHubStarsButton } from '@/components/github-stars-button'
import { InstallCommand, ProjectLink } from '@/components/catalog-row'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { CatalogProject } from '@/data/projects'
import { cn } from '@/lib/utils'

export function ProjectPreviewCard({
  project,
  featured = false,
}: {
  project: CatalogProject
  featured?: boolean
}) {
  const githubUrl = project.githubUrl ?? project.href
  const previewLabel = project.to ? 'Open preview' : 'Open project'

  return (
    <Card className={cn('gap-0 py-0', featured && 'lg:col-span-1')}>
      <div
        className={cn(
          'overflow-hidden border-b bg-muted/40',
          featured ? 'min-h-48' : 'min-h-40',
        )}
      >
        <div
          className={cn(
            'flex h-full items-center justify-center p-5',
            featured && 'p-6',
          )}
        >
          <ProjectScene id={project.id} />
        </div>
      </div>
      <CardHeader className="gap-2 px-5 pt-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-mono text-base font-medium tracking-tight">
            {project.name}
          </CardTitle>
          {project.language ? (
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {project.language}
            </span>
          ) : null}
        </div>
        <CardDescription className="text-sm leading-relaxed">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pt-4">
        {project.installCommand ? (
          <div className="overflow-hidden rounded-md border">
            <InstallCommand command={project.installCommand} />
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2 px-5 pt-3 pb-5">
        <ProjectLink
          project={project}
          className={buttonVariants({ size: 'sm' })}
        >
          {previewLabel}
          <ArrowUpRight data-icon="inline-end" />
        </ProjectLink>
        {githubUrl ? (
          <GitHubStarsButton href={githubUrl} stars={project.stars ?? 0} />
        ) : null}
      </CardFooter>
    </Card>
  )
}

function ProjectScene({ id }: { id: string }) {
  const scene = SCENES[id] ?? DefaultScene
  return scene()
}

function Keycap({
  label,
  wide = false,
  active = false,
}: {
  label: string
  wide?: boolean
  active?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-md border bg-background font-mono text-sm shadow-sm',
        wide ? 'min-w-20 px-4' : 'min-w-9 px-2',
        active && 'border-primary bg-primary text-primary-foreground',
      )}
    >
      {label}
    </span>
  )
}

function PeriodSpaceScene() {
  return (
    <div className="flex items-end gap-2">
      <Keycap label="space" wide />
      <Keycap label="space" wide />
      <span className="pb-2 font-mono text-muted-foreground">→</span>
      <Keycap label="." active />
    </div>
  )
}

function SwatchRow({ colors }: { colors: string[] }) {
  return (
    <div className="flex overflow-hidden rounded-md border">
      {colors.map((color) => (
        <span
          key={color}
          className="size-auto h-16 w-10 sm:h-20 sm:w-12"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}

function DiscordThemesScene() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center gap-3">
        <SwatchRow colors={['#1e1e2e', '#313244', '#cba6f7', '#89b4fa', '#a6e3a1']} />
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
          mocha
        </span>
      </div>
      <div className="flex items-center gap-3">
        <SwatchRow colors={['#12141a', '#1c1f27', '#c47d1a', '#8aa0b8', '#d8dee9']} />
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
          charcoal
        </span>
      </div>
    </div>
  )
}

function TampermonkeyScene() {
  return (
    <div className="w-full max-w-sm rounded-md border bg-background p-3">
      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <span>github.com</span>
        <span className="rounded-sm bg-primary px-1.5 py-0.5 text-primary-foreground">
          repos
        </span>
        <span className="rounded-sm bg-muted px-1.5 py-0.5">bbp repos</span>
      </div>
    </div>
  )
}

function MouseFixScene() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-10 flex-col overflow-hidden rounded-full border bg-background">
        <div className="h-6 border-b" />
        <div className="flex flex-1">
          <div className="w-1/2 border-r bg-primary/40" />
          <div className="w-1/2" />
        </div>
      </div>
      <div className="flex gap-1">
        {['1', '2', '3'].map((space, index) => (
          <span
            key={space}
            className={cn(
              'flex size-10 items-center justify-center rounded-md border font-mono text-xs',
              index === 1
                ? 'border-primary bg-primary/15 text-primary'
                : 'bg-background',
            )}
          >
            {space}
          </span>
        ))}
      </div>
    </div>
  )
}

function CodexCleanerScene() {
  return (
    <div className="w-full max-w-sm rounded-md border bg-background p-3 font-mono text-xs leading-6">
      <p className="text-muted-foreground">$ codex-cleaner</p>
      <p>keep chats</p>
      <p>archive clutter</p>
      <p className="text-primary">rotate logs</p>
    </div>
  )
}

function BettergitScene() {
  return (
    <svg viewBox="0 0 180 72" className="h-16 w-44 text-primary" aria-hidden>
      <path
        d="M12 52 C40 52, 40 20, 72 20 S120 52, 168 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="52" r="5" fill="currentColor" />
      <circle cx="72" cy="20" r="5" fill="currentColor" />
      <circle cx="168" cy="52" r="5" fill="currentColor" />
    </svg>
  )
}

function ScriptsScene() {
  return (
    <div className="w-full max-w-sm rounded-md border bg-background p-3 font-mono text-xs leading-6 text-muted-foreground">
      <p>// ==UserScript==</p>
      <p className="text-foreground">// @name github-repos-links</p>
      <p>// ==/UserScript==</p>
    </div>
  )
}

function ReleasesScene() {
  return (
    <div className="w-full max-w-sm rounded-md border bg-background p-3 font-mono text-xs leading-6">
      <p className="text-muted-foreground">SHA256</p>
      <p className="truncate text-foreground">3f2c…b91a  devcloud</p>
      <p className="truncate text-muted-foreground">9aa1…00e4  checksums.txt</p>
    </div>
  )
}

function HapcordScene() {
  return (
    <div className="flex w-full max-w-sm overflow-hidden rounded-md border bg-background">
      <div className="flex w-10 flex-col gap-2 bg-muted p-2">
        <span className="size-6 rounded-full bg-primary" />
        <span className="size-6 rounded-full bg-foreground/20" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <span className="h-2 w-24 rounded-full bg-muted-foreground/40" />
        <span className="h-2 w-32 rounded-full bg-muted-foreground/25" />
        <span className="h-2 w-16 rounded-full bg-primary/60" />
      </div>
    </div>
  )
}

function CodexBarScene() {
  return (
    <div className="flex w-full max-w-sm items-center justify-between rounded-md border bg-background px-3 py-2 font-mono text-xs">
      <span className="text-muted-foreground">CodexBar</span>
      <span className="flex items-center gap-2">
        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <span className="block h-full w-2/3 bg-primary" />
        </span>
        64%
      </span>
    </div>
  )
}

function DefaultScene() {
  return (
    <div className="rounded-md border bg-background px-4 py-3 font-mono text-sm text-muted-foreground">
      source/
    </div>
  )
}

const SCENES: Record<string, () => ReactNode> = {
  'period-space': PeriodSpaceScene,
  'discord-themes': DiscordThemesScene,
  tampermonkey: TampermonkeyScene,
  'mmf-golden-gate-fixer': MouseFixScene,
  'codex-cleaner': CodexCleanerScene,
  bettergit: BettergitScene,
  'custom-scripts': ScriptsScene,
  'devcloud-releases': ReleasesScene,
  hapcord: HapcordScene,
  codexbar: CodexBarScene,
}
