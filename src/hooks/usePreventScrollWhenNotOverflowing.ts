import { useEffect } from 'react'
import type { RefObject } from 'react'

function elementCanScrollY(element: HTMLElement) {
  const style = window.getComputedStyle(element)
  const overflowY = style.overflowY
  const allowsScroll =
    overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay'

  if (!allowsScroll) return false
  return element.scrollHeight - element.clientHeight > 1
}

function findScrollableAncestor(
  start: HTMLElement,
  stopAt: HTMLElement,
) {
  let current: HTMLElement | null = start
  while (current && current !== stopAt) {
    if (elementCanScrollY(current)) return current
    current = current.parentElement
  }
  return null
}

export function usePreventScrollWhenNotOverflowing(
  ref: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const container = ref.current
    if (!container) return

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      if (!(event.target instanceof HTMLElement)) return
      if (findScrollableAncestor(event.target, container)) return

      const overflow = container.scrollHeight - container.clientHeight
      if (overflow <= 1) {
        event.preventDefault()
      }
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!(event.target instanceof HTMLElement)) return
      if (findScrollableAncestor(event.target, container)) return

      const overflow = container.scrollHeight - container.clientHeight
      if (overflow <= 1) {
        event.preventDefault()
      }
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchmove', onTouchMove)
    }
  }, [ref])
}

