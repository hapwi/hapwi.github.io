import { Link, useRouterState } from '@tanstack/react-router'
import { BookOpen, Code2, Github, Palette, ShieldCheck, GitBranch } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { SearchCommand } from '@/components/search-command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: 'Code', icon: BookOpen },
  { path: '/discord-themes', label: 'Themes', icon: Palette },
  { path: '/tampermonkey', label: 'Tampermonkey', icon: ShieldCheck },
  { path: '/bbpcn', label: 'BBPCN', icon: GitBranch },
]

export default function Header() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-80"
            aria-label="hapwi home"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary/90 to-primary shadow-sm ring-1 ring-primary/20">
              <Code2 className="size-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold">hapwi</span>
          </Link>

          {/* Separator */}
          <div className="hidden h-5 w-px bg-border/60 sm:block" />

          {/* Navigation */}
          <nav className="hidden items-center gap-0.5 sm:flex">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'group relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive(path)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn(
                  'size-3.5 transition-colors',
                  isActive(path) ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                {label}
                {/* Active indicator */}
                <span
                  className={cn(
                    'absolute inset-x-0 -bottom-[17px] h-0.5 rounded-full bg-primary transition-all',
                    isActive(path) ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </Link>
            ))}
          </nav>

          {/* Mobile nav */}
          <nav className="flex items-center gap-1 sm:hidden">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                  isActive(path)
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Icon className="size-3.5" />
                <span className="sr-only xs:not-sr-only">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-1">
            <SearchCommand />

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://github.com/hapwi"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub profile"
              >
                <Github className="size-4" />
                <span className="hidden text-sm font-normal sm:inline">GitHub</span>
              </a>
            </Button>

            <div className="hidden h-4 w-px bg-border/60 sm:block" />

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
