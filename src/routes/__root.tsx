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
