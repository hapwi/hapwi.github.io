import { Outlet, createRootRoute } from '@tanstack/react-router'

import Header from '@/components/Header'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const Route = createRootRoute({
  component: () => (
    <SidebarProvider className="bg-background text-foreground antialiased min-h-screen">
      <AppSidebar />
      <SidebarInset>
        <Header />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  ),
})
