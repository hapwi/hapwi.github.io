import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test'

import { curatedProjects } from '@/data/projects'
import { SearchCommand } from '@/components/search-command'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  toastError: vi.fn(),
}))

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver
  Element.prototype.scrollIntoView = vi.fn()
})

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  }
})

vi.mock('@/hooks/use-catalog', () => ({
  useCatalog: () => ({ projects: curatedProjects }),
}))

vi.mock('sonner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sonner')>()
  return {
    ...actual,
    toast: { error: mocks.toastError },
  }
})

function openSearch() {
  render(<SearchCommand />)
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
}

afterEach(() => {
  cleanup()
  mocks.navigate.mockReset()
  mocks.toastError.mockReset()
})

describe('SearchCommand navigation', () => {
  it('navigates project results with repo params', () => {
    mocks.navigate.mockResolvedValue(undefined)
    openSearch()

    fireEvent.click(screen.getByText('period-space'))

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: '/repos/$repo',
      params: { repo: 'period-space' },
      search: { file: undefined, path: undefined },
    })
  })

  it('navigates folder results to their collection', () => {
    mocks.navigate.mockResolvedValue(undefined)
    openSearch()

    fireEvent.click(screen.getByText('Discord'))

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: '/discord-themes',
      search: { file: undefined },
    })
  })

  it('navigates theme and script files to the correct details', () => {
    mocks.navigate.mockResolvedValue(undefined)
    openSearch()

    fireEvent.click(screen.getByText('Equicord Starter Theme File'))
    expect(mocks.navigate).toHaveBeenLastCalledWith({
      to: '/discord-themes',
      search: { file: '/discord/themes/equicord.theme.css' },
    })

    cleanup()
    openSearch()
    fireEvent.click(screen.getByText('GitHub Repos Quick Links'))
    expect(mocks.navigate).toHaveBeenLastCalledWith({
      to: '/tampermonkey',
      search: {
        file: '/tampermonkey/scripts/github-repos-links.user.js',
      },
    })
  })

  it('handles rejected navigation instead of leaking the route error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mocks.navigate.mockRejectedValueOnce(new Error('route failed'))
    openSearch()

    fireEvent.click(screen.getByText('period-space'))

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        'Unable to open that result',
      )
    })
    expect(consoleError).toHaveBeenCalledWith(
      'Search navigation failed:',
      expect.any(Error),
    )
    consoleError.mockRestore()
  })
})
