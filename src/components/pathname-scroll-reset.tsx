import { useLayoutEffect, useRef } from 'react'
import { useRouterState } from '@tanstack/react-router'

export function resetDocumentScroll() {
  document.documentElement.scrollTop = 0
  document.documentElement.scrollLeft = 0
  document.body.scrollTop = 0
  document.body.scrollLeft = 0
}

export function usePathnameScrollReset(pathname: string) {
  const previousPathname = useRef(pathname)

  useLayoutEffect(() => {
    if (previousPathname.current === pathname) return

    previousPathname.current = pathname
    resetDocumentScroll()
  }, [pathname])
}

export function PathnameScrollReset() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  usePathnameScrollReset(pathname)
  return null
}
