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
    <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden rounded-t-3xl border-t bg-background pb-[env(safe-area-inset-bottom,0px)]">
      <nav
        aria-label="Primary"
        className="grid min-h-[3.75rem] w-full grid-cols-3 sm:min-h-16"
      >
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path)

          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex min-h-[3.75rem] min-w-0 flex-col items-center justify-center gap-1 px-0 py-3 text-[0.6875rem] leading-none text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-16',
                active && 'text-primary',
              )}
            >
              <span className="relative grid size-6 shrink-0 place-items-center">
                <HugeiconsIcon
                  icon={Icon}
                  strokeWidth={2}
                  className="size-6"
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
