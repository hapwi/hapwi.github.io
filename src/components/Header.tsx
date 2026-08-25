import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  BookOpen,
  Github,
  GitBranch,
  Menu,
  Palette,
  Terminal,
} from 'lucide-react'

import { HapwiMark } from '@/components/hapwi-mark'
import { ModeToggle } from '@/components/mode-toggle'
import { SearchCommand } from '@/components/search-command'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GITHUB_OWNER } from '@/lib/github'

const navItems = [
  { path: '/', label: 'Work', icon: BookOpen },
  { path: '/discord-themes', label: 'Themes', icon: Palette },
  { path: '/tampermonkey', label: 'Scripts', icon: Terminal },
  { path: '/repos', label: 'Repos', icon: GitBranch },
] as const

export default function Header() {
  const routerState = useRouterState()
  const navigate = useNavigate()
  const pathname = routerState.location.pathname

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    if (path === '/repos') return pathname.startsWith('/repos')
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-2 px-4 sm:h-14 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HapwiMark className="size-7" />
          <span className="font-display text-sm font-semibold tracking-tight max-sm:sr-only">
            hapwi
          </span>
        </Link>

        <nav className="hidden md:block" aria-label="Primary">
          <ButtonGroup>
            {navItems.map(({ path, label }) => (
              <Button
                key={path}
                asChild
                variant={isActive(path) ? 'secondary' : 'ghost'}
                size="sm"
              >
                <Link to={path}>{label}</Link>
              </Button>
            ))}
          </ButtonGroup>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu data-icon="inline-start" />
              Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {navItems.map(({ path, label, icon: Icon }) => (
              <DropdownMenuItem
                key={path}
                data-active={isActive(path)}
                onClick={() => {
                  if (path === '/') {
                    void navigate({ to: '/' })
                    return
                  }
                  if (path === '/discord-themes') {
                    void navigate({
                      to: '/discord-themes',
                      search: { file: undefined },
                    })
                    return
                  }
                  if (path === '/tampermonkey') {
                    void navigate({
                      to: '/tampermonkey',
                      search: { file: undefined },
                    })
                    return
                  }
                  void navigate({ to: '/repos' })
                }}
              >
                <Icon />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-1">
          <SearchCommand />
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <a
              href={`https://github.com/${GITHUB_OWNER}`}
              target="_blank"
              rel="noreferrer"
            >
              <Github data-icon="inline-start" />
              GitHub
            </a>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
