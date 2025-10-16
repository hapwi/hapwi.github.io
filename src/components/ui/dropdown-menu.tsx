import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SetStateAction,
} from 'react'

import { cn } from '@/lib/utils'

type DropdownMenuContextValue = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null)

type DropdownMenuProps = {
  children: ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)

  const value = useMemo(() => ({ open, setOpen }), [open])

  return (
    <DropdownMenuContext.Provider value={value}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

type DropdownMenuTriggerProps = ComponentPropsWithoutRef<'button'> & {
  asChild?: boolean
}

export const DropdownMenuTrigger = forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ children, asChild, onClick, ...props }, ref) => {
  const context = useDropdownMenuContext()

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      context.setOpen((previous) => !previous)
      if (onClick) {
        onClick(event)
      }
    },
    [context, onClick],
  )

  if (asChild && isValidElement(children)) {
    const child = Children.only(children)
    return cloneElement(child, {
      ref,
      onClick: handleClick,
      'aria-haspopup': 'menu',
      'aria-expanded': context.open,
    } as unknown as Record<string, unknown>)
  }

  return (
    <button
      type="button"
      {...props}
      ref={ref}
      onClick={handleClick}
      aria-haspopup="menu"
      aria-expanded={context.open}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

type DropdownMenuContentProps = ComponentPropsWithoutRef<'div'> & {
  align?: 'start' | 'end'
}

export const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ className, align = 'start', children, ...props }, ref) => {
  const context = useDropdownMenuContext()
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!context.open) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        !contentRef.current?.contains(target) &&
        !isInsideTrigger(event.target)
      ) {
        context.setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        context.setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [context])

  const setRefs = (node: HTMLDivElement | null) => {
    contentRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ;(ref as { current: HTMLDivElement | null }).current = node
    }
  }

  if (!context.open) {
    return null
  }

  return (
    <div
      ref={setRefs}
      role="menu"
      className={cn(
        'absolute z-50 mt-2 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg focus:outline-none data-[state=open]:animate-in',
        align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuContent.displayName = 'DropdownMenuContent'

type DropdownMenuItemProps = ComponentPropsWithoutRef<'button'>

export const DropdownMenuItem = forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps
>(({ className, onClick, children, ...props }, ref) => {
  const context = useDropdownMenuContext()

  const handleClick: typeof onClick = (event) => {
    if (onClick) {
      onClick(event)
    }
    context.setOpen(false)
  }

  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground',
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuItem.displayName = 'DropdownMenuItem'

function useDropdownMenuContext() {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error(
      'DropdownMenu components must be used within a DropdownMenu provider',
    )
  }
  return context
}

function isInsideTrigger(target: EventTarget | null) {
  if (!(target instanceof Node)) {
    return false
  }
  let current: Node | null = target
  while (current) {
    if (
      current instanceof HTMLElement &&
      current.getAttribute('aria-haspopup') === 'menu'
    ) {
      return true
    }
    current = current.parentNode
  }
  return false
}
