import { Outlet, createRootRoute } from '@tanstack/react-router'

import { BottomNav } from '@/components/bottom-nav'
import Header from '@/components/Header'
import { PathnameScrollReset } from '@/components/pathname-scroll-reset'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <TooltipProvider>
      <PathnameScrollReset />
      <div className="app-shell relative flex min-h-dvh flex-col bg-background text-foreground antialiased">
        <Header />
        <div className="flex min-h-0 flex-1 flex-col bg-muted/20 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
          <Outlet />
        </div>
        <BottomNav />
        <Toaster position="top-right" />
      </div>
    </TooltipProvider>
  )
}
