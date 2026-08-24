import { ArrowRight } from 'lucide-react'

import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { cn } from '@/lib/utils'

export function StarOnGitHub({
  href,
  children = 'Star on GitHub',
  className,
}: {
  href: string
  children?: string
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group inline-flex rounded-full border border-border bg-muted/50 transition-colors hover:bg-muted',
        className,
      )}
    >
      <AnimatedShinyText className="mx-0 inline-flex max-w-none items-center gap-2 px-4 py-1">
        <span>{children}</span>
        <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
      </AnimatedShinyText>
    </a>
  )
}
