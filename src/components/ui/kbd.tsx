import { cn } from '@/lib/utils'

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-7 w-fit min-w-7 -translate-y-px items-center justify-center gap-1 rounded-md border bg-card px-2 font-sans text-xs font-medium text-foreground shadow-[0_2px_0_var(--border)] select-none in-data-[slot=input-group]:h-5.5 in-data-[slot=input-group]:min-w-5.5 in-data-[slot=input-group]:translate-y-0 in-data-[slot=input-group]:border-0 in-data-[slot=input-group]:bg-input in-data-[slot=input-group]:px-1.5 in-data-[slot=input-group]:shadow-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
