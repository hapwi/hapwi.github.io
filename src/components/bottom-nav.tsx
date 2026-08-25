import { Link, useRouterState } from '@tanstack/react-router'
import {
  BookOpen01Icon,
  CodeSquareIcon,
  PaintBoardIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: 'Work', icon: BookOpen01Icon },
  { path: '/discord-themes', label: 'Themes', icon: PaintBoardIcon },
  { path: '/tampermonkey', label: 'Scripts', icon: CodeSquareIcon },
] as const

export function BottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const isActive = (path: (typeof navItems)[number]['path']) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden rounded-t-[1.375rem] border-t bg-background pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_-20px_rgba(0,0,0,0.7)]">
      <nav
        aria-label="Primary"
        className="grid min-h-[5.25rem] w-full grid-cols-3 px-2 sm:min-h-[5.5rem] sm:px-4"
      >
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path)

          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-2 text-[0.8125rem] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                active && 'text-primary',
              )}
            >
              <span
                className={cn(
                  'grid size-11 place-items-center rounded-full transition-colors',
                  active &&
                    'bg-primary text-primary-foreground shadow-sm shadow-primary/25',
                  !active &&
                    'group-hover:bg-accent group-hover:text-accent-foreground',
                )}
              >
                <HugeiconsIcon
                  icon={Icon}
                  strokeWidth={2}
                  className="size-5.5"
                  aria-hidden="true"
                />
              </span>
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
