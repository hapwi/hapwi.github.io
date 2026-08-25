import { render } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'

import { usePathnameScrollReset } from '@/components/pathname-scroll-reset'

function ScrollResetHarness({ pathname }: { pathname: string }) {
  usePathnameScrollReset(pathname)
  return null
}

describe('usePathnameScrollReset', () => {
  it('resets document scroll in the layout phase when pathname changes', () => {
    const { rerender } = render(<ScrollResetHarness pathname="/" />)

    document.documentElement.scrollTop = 1400
    document.body.scrollTop = 1400
    rerender(<ScrollResetHarness pathname="/discord-themes" />)

    expect(document.documentElement.scrollTop).toBe(0)
    expect(document.body.scrollTop).toBe(0)
  })

  it('preserves scroll for same-path query transitions', () => {
    const { rerender } = render(
      <ScrollResetHarness pathname="/discord-themes" />,
    )

    document.documentElement.scrollTop = 720
    document.body.scrollTop = 720
    rerender(<ScrollResetHarness pathname="/discord-themes" />)

    expect(document.documentElement.scrollTop).toBe(720)
    expect(document.body.scrollTop).toBe(720)
  })
})
