import { Button } from '@/components/ui/button'

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
    <Button asChild variant="outline" className={className}>
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    </Button>
  )
}
