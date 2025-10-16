import type { ReactNode } from 'react'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, FileCode2, FolderGit2, LayoutTemplate } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

const codeLibrary = [
  {
    name: 'custompuccin.custom.css',
    description:
      'Custom Puccin theme variant with colors tweaked for higher contrast and softer gradients.',
    language: 'CSS',
    path: '/discord/themes/custompuccin.custom.css',
  },
  {
    name: 'equicord.theme.css',
    description: 'Equicord-ready base theme with variables structured for quick overrides.',
    language: 'CSS',
    path: '/discord/themes/equicord.theme.css',
  },
]

const pinnedProjects = [
  {
    title: 'hapwi.github.io',
    description:
      'The central hub for experiments, write-ups, and hosted resources. Built with Vite, TanStack Router, and Tailwind CSS.',
    link: 'https://github.com/hapwi/hapwi.github.io',
    cta: 'View repository',
  },
  {
    title: 'Discord Themes',
    description:
      'Curated CSS themes for Discord client mods. Served directly from the code library so they stay easy to share and version.',
    link: codeLibrary[0]?.path ?? '#code-library',
    cta: codeLibrary[0] ? `Open ${codeLibrary[0].name}` : 'Browse themes',
  },
  {
    title: 'Snippet Archive',
    description:
      'A growing collection of handy snippets for tooling, automation, and theming. Drop files into `public/` and ship them instantly.',
    link: '#code-library',
    cta: 'Browse library',
  },
]

function HomeRoute() {
  const [selectedAssetPath, setSelectedAssetPath] = useState(
    codeLibrary[0]?.path ?? '',
  )
  const activeAsset =
    codeLibrary.find((asset) => asset.path === selectedAssetPath) ??
    codeLibrary[0]

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-cyan-500/10 via-slate-900/40 to-slate-950" />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-24 px-4 pb-24 pt-24 md:gap-28 md:px-6 md:pb-32 md:pt-28">
        <section
          id="home"
          className="grid gap-10 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] md:items-center"
        >
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.4em] text-cyan-300/80">
              Hapwi HQ
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Building useful things and leaving the source open for anyone who
              needs it.
            </h1>
            <p className="max-w-xl text-lg text-slate-300">
              This space doubles as my personal site and a fast CDN for code
              drops—perfect for sharing Discord themes, experiments, and handy
              snippets without any friction.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                Explore projects
                <ArrowRight size={16} />
              </a>
              <a
                href="#code-library"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors duration-150 hover:border-cyan-400 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                View code library
              </a>
            </div>
          </div>

          <div className="relative hidden h-full overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 via-slate-900/20 to-cyan-500/10 p-8 shadow-2xl md:block">
            <div className="pointer-events-none absolute -right-16 top-6 h-40 w-40 rounded-full bg-cyan-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="relative space-y-4">
              <h2 className="text-2xl font-semibold text-cyan-200">
                Instant raw file hosting
              </h2>
              <p className="text-sm text-slate-200/80">
                Drop any file inside <code className="rounded bg-slate-900/80 px-2 py-1">
                  public/
                </code>{' '}
                and ship it straight to the web. Perfect for theming files,
                release builds, or quick references.
              </p>
              <div className="space-y-3">
                <label
                  htmlFor="asset-select"
                  className="block text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80"
                >
                  Select a hosted file
                </label>
                <select
                  id="asset-select"
                  value={activeAsset?.path ?? ''}
                  onChange={(event) => setSelectedAssetPath(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-medium text-slate-100 outline-none transition-colors duration-150 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
                >
                  {codeLibrary.map((asset) => (
                    <option key={asset.path} value={asset.path}>
                      {asset.name}
                    </option>
                  ))}
                </select>
                {activeAsset ? (
                  <p className="text-xs text-slate-300/80">
                    {activeAsset.description}
                  </p>
                ) : null}
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm text-slate-200/70">
                <div>
                  <dt className="font-medium text-slate-100">File name</dt>
                  <dd className="truncate">{activeAsset?.name ?? 'Not available'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-100">Path</dt>
                  <dd className="truncate">{activeAsset?.path ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-100">Content-Type</dt>
                  <dd>Served as raw text</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-100">Deploy</dt>
                  <dd>Commit + push to main</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-100">Access</dt>
                  <dd>Public GitHub Pages</dd>
                </div>
              </dl>
              {activeAsset ? (
                <a
                  href={activeAsset.path}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition-colors duration-150 hover:border-cyan-400 hover:text-cyan-200"
                >
                  Open {activeAsset.name}
                  <ArrowRight size={14} />
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <section id="projects" className="space-y-8">
          <SectionHeading
            eyebrow="Projects"
            title="Pinned work & experiments"
            description="Highlights from the things I am actively shipping. Everything links out to either GitHub or the raw resource."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {pinnedProjects.map(({ title, description, link, cta }) => (
              <a
                key={title}
                href={link}
                className="group relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-900/60 p-6 transition-transform duration-200 hover:-translate-y-1.5 hover:border-cyan-400/60 hover:bg-slate-900/80"
                target={link.startsWith('http') ? '_blank' : undefined}
                rel={link.startsWith('http') ? 'noreferrer' : undefined}
              >
                <FolderGit2
                  size={20}
                  className="text-cyan-300 transition-transform duration-200 group-hover:scale-110"
                />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="text-sm text-slate-300/90">{description}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition-colors duration-150 group-hover:text-cyan-200">
                  {cta}
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section id="code-library" className="space-y-8">
          <SectionHeading
            eyebrow="Code Library"
            title="Hosted files & snippets"
            description="These files live in the public/ directory, so visiting the URL will render the raw content in the browser or let you download it directly."
          />
          <div className="grid gap-5">
            {codeLibrary.map(({ name, description, language, path }) => (
              <a
                key={name}
                href={path}
                className="group flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-cyan-400/60 hover:bg-slate-900/80"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCode2
                      size={18}
                      className="text-cyan-300 transition-transform duration-200 group-hover:scale-105"
                    />
                    <h3 className="text-lg font-semibold">{name}</h3>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
                    {language}
                  </span>
                </div>
                <p className="text-sm text-slate-300/90">{description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition-colors duration-150">
                  Open raw file
                  <ArrowRight size={14} />
                </span>
              </a>
            ))}
          </div>
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 p-6 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <LayoutTemplate size={18} className="mt-0.5 text-cyan-300" />
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-100">
                  Add new assets in seconds
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm leading-6">
                  <li>Create folders in <code>public/</code> to match the URL structure you want.</li>
                  <li>Commit and push—GitHub Pages will serve the file at the same path.</li>
                  <li>Link to it from any route or share the direct URL externally.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold text-slate-100 md:text-[2.1rem]">
        {title}
      </h2>
      <p className="max-w-2xl text-base text-slate-300/90">{description}</p>
    </div>
  )
}
