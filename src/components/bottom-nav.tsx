import { Link, useRouterState } from '@tanstack/react-router'
import {
  BookOpen01Icon,
  CodeSquareIcon,
  FolderLibraryIcon,
  PaintBoardIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { isNavActive } from '@/components/Header'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: 'Work', icon: BookOpen01Icon },
  { path: '/repos', label: 'Repos', icon: FolderLibraryIcon },
  { path: '/discord-themes', label: 'Themes', icon: PaintBoardIcon },
  { path: '/tampermonkey', label: 'Scripts', icon: CodeSquareIcon },
] as const

export function BottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden">
      <nav
        aria-label="Primary"
        className="grid min-h-[3.75rem] w-full grid-cols-4"
      >
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isNavActive(pathname, path)

          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-[3.75rem] min-w-0 flex-col items-center justify-center gap-1 px-0 py-2.5 text-[0.6875rem] font-medium leading-none text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                active && 'text-foreground',
              )}
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-6 top-0 h-0.5 rounded-b-full bg-brand"
                />
              ) : null}
              <HugeiconsIcon
                icon={Icon}
                strokeWidth={1.75}
                className="size-[1.375rem]"
                aria-hidden="true"
              />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
