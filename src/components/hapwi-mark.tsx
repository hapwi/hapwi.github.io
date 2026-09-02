import { cn } from '@/lib/utils'

/** The favicon mark: graphite tile with the amber "h". Stays the same in both color modes. */
export function HapwiMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('size-8 shrink-0', className)}
      aria-hidden
    >
      <rect
        width="32"
        height="32"
        rx="7"
        className="fill-[oklch(0.21_0.01_260)] dark:fill-[oklch(0.27_0.01_260)]"
      />
      <g
        className="fill-brand"
        transform="translate(8.05 26.1) scale(0.02703 -0.02703)"
      >
        <path d="M74 740H202V435H207Q223 477 257.5 505.5Q292 534 353 534Q434 534 477 481Q520 428 520 330V0H392V317Q392 373 372 401Q352 429 306 429Q286 429 267.5 423.5Q249 418 234.5 407.5Q220 397 211 381.5Q202 366 202 345V0H74Z" />
      </g>
    </svg>
  )
}
