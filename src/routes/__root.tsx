import { Outlet, createRootRoute } from '@tanstack/react-router'

import Header from '@/components/Header'

export const Route = createRootRoute({
  component: () => (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-background text-foreground antialiased">
      {/* Subtle background pattern */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-linear-to-br from-primary/2 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-linear-to-tl from-primary/2 to-transparent blur-3xl" />
      </div>
      <Header />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <Outlet />
      </div>
    </div>
  ),
})
