import { Link } from '@tanstack/react-router'

import { HapwiMark } from '@/components/hapwi-mark'
import { hubSyncedAt } from '@/data/hub'
import { GITHUB_OWNER } from '@/lib/github'

function formatSyncDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function SiteFooter() {
  const synced = formatSyncDate(hubSyncedAt)

  return (
    <footer className="border-t">
      <div className="site-container flex flex-col gap-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <HapwiMark className="size-5" />
          <span>
            <span className="font-medium text-foreground">hapwi</span> ·
            open-source tools for macOS and Linux
          </span>
        </div>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <li>
            <Link to="/repos" className="hover:text-foreground">
              Repositories
            </Link>
          </li>
          <li>
            <a
              href={`https://github.com/${GITHUB_OWNER}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href={`https://github.com/${GITHUB_OWNER}/hapwi.github.io`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              Site source
            </a>
          </li>
          {synced ? (
            <li className="font-mono text-xs tabular-nums">Synced {synced}</li>
          ) : null}
        </ul>
      </div>
    </footer>
  )
}
