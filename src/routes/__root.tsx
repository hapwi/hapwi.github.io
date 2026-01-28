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
    <div className="paper-texture relative flex h-dvh flex-col overflow-hidden bg-background text-foreground antialiased">
      {/* Editorial gradient accent - subtle top edge */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[300px] bg-gradient-to-b from-primary/[0.03] to-transparent" />

      {/* Subtle corner accents */}
      <div className="pointer-events-none fixed -z-10 inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-primary/[0.04] to-transparent blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-primary/[0.03] to-transparent blur-3xl" />
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
