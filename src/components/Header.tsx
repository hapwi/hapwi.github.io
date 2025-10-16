import { Link } from '@tanstack/react-router'
import { Github, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Projects', href: '#projects' },
  { label: 'Code Library', href: '#code-library' },
  { label: 'Contact', href: '#contact' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold tracking-wide">
          hapwi
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-200 md:flex">
          {navItems.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="transition-colors duration-150 hover:text-cyan-300"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/hapwi"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 p-2 text-slate-200 transition-colors duration-150 hover:border-cyan-400 hover:text-cyan-300"
            aria-label="GitHub profile"
          >
            <Github size={18} />
          </a>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-full border border-white/10 p-2 text-slate-200 transition-colors duration-150 hover:border-cyan-400 hover:text-cyan-300 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-slate-950/90 backdrop-blur transition-opacity duration-200 md:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute right-4 top-4">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full border border-white/10 p-2 text-slate-200 transition-colors duration-150 hover:border-cyan-400 hover:text-cyan-300"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex h-full flex-col items-center justify-center gap-6 text-lg font-semibold text-slate-100">
          {navItems.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="transition-colors duration-150 hover:text-cyan-300"
              onClick={() => setIsOpen(false)}
            >
              {label}
            </a>
          ))}
          <a
            href="https://github.com/hapwi"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-cyan-300 transition-colors duration-150 hover:text-cyan-200"
            onClick={() => setIsOpen(false)}
          >
            <Github size={18} />
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
