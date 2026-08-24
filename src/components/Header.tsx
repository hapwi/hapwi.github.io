import { Link, useRouterState } from '@tanstack/react-router'
import { BookOpen, Github, GitBranch, Palette, Terminal } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { SearchCommand } from '@/components/search-command'
import { Button } from '@/components/ui/button'
import { GITHUB_OWNER } from '@/lib/github'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: 'Work', icon: BookOpen },
  { path: '/discord-themes', label: 'Themes', icon: Palette },
  { path: '/tampermonkey', label: 'Scripts', icon: Terminal },
  { path: '/repos', label: 'Repos', icon: GitBranch },
]

export default function Header() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    if (path === '/repos') {
      return pathname.startsWith('/repos')
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl supports-backdrop-filter:bg-background/80">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-2 sm:h-16 sm:gap-6">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="hapwi home"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-primary font-mono text-sm font-semibold text-primary-foreground sm:size-9">
              ▸
            </span>
            <span className="hidden flex-col leading-none xs:flex">
              <span className="font-display text-base font-semibold tracking-tight sm:text-lg">
                hapwi
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                ~/projects
              </span>
            </span>
          </Link>

          <div className="hidden h-6 w-px bg-border lg:block" />

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 text-sm font-medium tracking-wide',
                  isActive(path)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-4',
                    isActive(path) ? 'text-primary' : 'text-muted-foreground/70',
                  )}
                />
                {label}
                {isActive(path) ? (
                  <span className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-primary sm:-bottom-[17px]" />
                ) : null}
              </Link>
            ))}
          </nav>

          <nav className="ml-auto flex items-center gap-0.5 lg:hidden">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center justify-center rounded-md p-2',
                  isActive(path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                aria-label={label}
              >
                <Icon className="size-4" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 lg:ml-auto">
            <SearchCommand />

            <div className="hidden h-5 w-px bg-border/40 sm:block" />

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden h-9 px-3 text-muted-foreground hover:text-foreground sm:flex"
            >
              <a
                href={`https://github.com/${GITHUB_OWNER}`}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub profile"
              >
                <Github />
                <span className="hidden text-sm font-medium md:inline">GitHub</span>
              </a>
            </Button>

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
