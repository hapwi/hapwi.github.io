import { Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'

export function GitHubStarsButton({
  href,
  stars = 0,
}: {
  href: string
  stars?: number
}) {
  return (
    <Button asChild variant="outline" size="sm">
      <a href={href} target="_blank" rel="noreferrer">
        <Star data-icon="inline-start" />
        Star
        <NumberTicker value={stars} className="font-mono text-xs tracking-normal" />
      </a>
    </Button>
  )
}
