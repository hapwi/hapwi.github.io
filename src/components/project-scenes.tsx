import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

function MiniWindow({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border bg-background">
      <div className="border-b px-2.5 py-1.5">
        <span className="truncate font-mono text-[10px] text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  )
}

function PeriodSpaceScene() {
  return (
    <MiniWindow title="foot — period-space">
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col justify-center gap-1 px-3 font-mono text-xs">
          <p className="text-muted-foreground">~/draft.md</p>
          <p>
            hello world
            <span className="bg-primary px-0.5 text-primary-foreground">.</span>
          </p>
        </div>
        <div className="flex items-center justify-center gap-1.5 border-t px-3 py-2">
          <KbdGroup>
            <Kbd>space</Kbd>
            <Kbd>space</Kbd>
          </KbdGroup>
          <span className="text-muted-foreground">→</span>
          <Badge>.</Badge>
        </div>
      </div>
    </MiniWindow>
  )
}

function DiscordThemesScene() {
  return (
    <MiniWindow title="vencord · mocha">
      <div className="flex h-full">
        <div className="flex w-9 flex-col items-center gap-1.5 bg-[#1e1e2e] py-2">
          <span className="size-5 rounded-full bg-[#cba6f7]" />
          <span className="size-5 rounded-full bg-[#313244]" />
          <span className="size-5 rounded-full bg-[#45475a]" />
        </div>
        <div className="flex w-[5.5rem] flex-col gap-2 bg-[#181825] px-2 py-2">
          <span className="h-1.5 w-14 rounded-full bg-[#cba6f7]" />
          <span className="h-1.5 w-10 rounded-full bg-[#a6adc8]/50" />
          <span className="h-1.5 w-12 rounded-full bg-[#a6adc8]/35" />
          <span className="mt-auto h-1.5 w-8 rounded-full bg-[#a6e3a1]" />
        </div>
        <div className="flex flex-1 flex-col justify-end gap-2 bg-[#1e1e2e] p-2">
          <div className="h-7 w-4/5 rounded-md bg-[#313244]" />
          <div className="h-7 w-3/5 rounded-md bg-[#45475a]" />
          <div className="h-6 rounded-md bg-[#313244]" />
        </div>
      </div>
    </MiniWindow>
  )
}

function TampermonkeyScene() {
  return (
    <MiniWindow title="github.com/hapwi">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-1.5 border-b px-2 py-1.5 font-mono text-[10px]">
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-muted-foreground">
            hapwi
          </span>
          <Badge>repos</Badge>
          <span className="text-muted-foreground">stars</span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2">
          <div className="h-2 w-24 rounded-full bg-muted" />
          <div className="h-2 w-full rounded-full bg-muted/70" />
          <div className="h-2 w-4/5 rounded-full bg-muted/50" />
          <div className="mt-auto h-8 rounded-md border bg-muted/30" />
        </div>
      </div>
    </MiniWindow>
  )
}

function MouseFixScene() {
  return (
    <MiniWindow title="Mission Control">
      <div className="flex h-full items-end justify-center gap-2 px-3 pb-3">
        {['1', '2', '3'].map((space, index) => (
          <div
            key={space}
            className={cn(
              'flex h-[4.5rem] w-16 flex-col overflow-hidden rounded-md border',
              index === 1 ? 'border-primary bg-primary/10' : 'bg-muted/40',
            )}
          >
            <div className="px-1.5 py-1">
              <Kbd>{space}</Kbd>
            </div>
            <div className="mx-1.5 mb-1.5 flex-1 rounded-sm bg-background" />
          </div>
        ))}
      </div>
    </MiniWindow>
  )
}

function CodexCleanerScene() {
  return (
    <MiniWindow title="codex-cleaner">
      <div className="flex h-full flex-col gap-1.5 px-3 py-2 font-mono text-[11px] leading-5">
        <p className="text-muted-foreground">$ codex-cleaner</p>
        <p>keep chats</p>
        <p>archive clutter</p>
        <p className="text-primary">rotate logs</p>
        <p className="text-muted-foreground">skip history</p>
      </div>
    </MiniWindow>
  )
}

function BettergitScene() {
  return (
    <MiniWindow title="bettergit graph">
      <div className="flex h-full items-center justify-center px-3">
        <svg
          viewBox="0 0 200 88"
          className="h-16 w-full text-primary"
          aria-hidden
        >
          <path
            d="M16 70 C48 70, 48 22, 88 22 S136 70, 184 70"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M88 22 C88 48, 120 48, 148 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.45"
          />
          <circle cx="16" cy="70" r="5" fill="currentColor" />
          <circle cx="88" cy="22" r="5" fill="currentColor" />
          <circle cx="148" cy="48" r="4" fill="currentColor" opacity="0.7" />
          <circle cx="184" cy="70" r="5" fill="currentColor" />
        </svg>
      </div>
    </MiniWindow>
  )
}

function ScriptsScene() {
  return (
    <MiniWindow title="github-repos-links.user.js">
      <div className="flex h-full flex-col gap-0.5 px-3 py-2 font-mono text-[11px] leading-5">
        <p className="text-muted-foreground">// ==UserScript==</p>
        <p>// @name github-repos-links</p>
        <p className="text-muted-foreground">// @match github.com/*</p>
        <p className="text-muted-foreground">// ==/UserScript==</p>
        <p className="text-primary">injectHeaderLinks()</p>
      </div>
    </MiniWindow>
  )
}

function ReleasesScene() {
  return (
    <MiniWindow title="checksums.txt">
      <div className="flex h-full flex-col gap-1.5 px-3 py-2 font-mono text-[11px] leading-5">
        <p className="text-muted-foreground">SHA256</p>
        <p className="truncate">3f2c…b91a  devcloud</p>
        <p className="truncate text-muted-foreground">9aa1…00e4  checksums.txt</p>
        <p className="truncate text-muted-foreground">c81e…44d0  notes.md</p>
      </div>
    </MiniWindow>
  )
}

function HapcordScene() {
  return (
    <MiniWindow title="hapcord">
      <div className="flex h-full">
        <div className="flex w-9 flex-col items-center gap-1.5 bg-muted py-2">
          <span className="size-5 rounded-full bg-primary" />
          <span className="size-5 rounded-full bg-foreground/20" />
          <span className="size-5 rounded-full bg-foreground/15" />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2 p-3">
          <span className="h-2 w-20 rounded-full bg-muted-foreground/40" />
          <span className="h-2 w-32 rounded-full bg-muted-foreground/25" />
          <span className="h-2 w-16 rounded-full bg-primary/70" />
          <span className="mt-1 h-8 rounded-md border bg-muted/40" />
        </div>
      </div>
    </MiniWindow>
  )
}

function CodexBarScene() {
  return (
    <MiniWindow title="CodexBar">
      <div className="flex h-full flex-col justify-center gap-3 px-3">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span>Codex</span>
          <span className="text-muted-foreground">64%</span>
        </div>
        <Progress value={64} />
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span>Claude</span>
          <span className="text-muted-foreground">28%</span>
        </div>
        <Progress value={28} />
      </div>
    </MiniWindow>
  )
}

function DefaultScene() {
  return (
    <MiniWindow title="source">
      <div className="flex h-full items-center justify-center">
        <Badge variant="outline">source/</Badge>
      </div>
    </MiniWindow>
  )
}

export const PROJECT_SCENES: Record<string, () => ReactNode> = {
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

export function ProjectScene({ id }: { id: string }) {
  return (PROJECT_SCENES[id] ?? DefaultScene)()
}
