import { useRef } from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'

import Header from '@/components/Header'
import { Toaster } from '@/components/ui/sonner'
import { usePreventScrollWhenNotOverflowing } from '@/hooks/usePreventScrollWhenNotOverflowing'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  usePreventScrollWhenNotOverflowing(scrollContainerRef)

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-background text-foreground antialiased">
      {/* Subtle background pattern */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-linear-to-br from-primary/2 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-linear-to-tl from-primary/2 to-transparent blur-3xl" />
      </div>
      <Header />
      <div
        ref={scrollContainerRef}
        className="flex min-h-0 flex-1 flex-col overflow-auto"
        style={{ scrollbarGutter: 'stable' }}
      >
        <Outlet />
      </div>
      <Toaster />
    </div>
  )
}
