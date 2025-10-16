import { Outlet, createRootRoute } from '@tanstack/react-router'

import Header from '../components/Header'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <Outlet />
    </div>
  ),
})
