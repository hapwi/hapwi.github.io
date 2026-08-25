import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FileCode2, FolderOpen, GitBranch, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { curatedProjects } from '@/data/projects'
import { useCatalog } from '@/hooks/use-catalog'
import { codeLibrary, folderGroups } from '@/lib/library'

function runNavigation(navigation: Promise<void>) {
  void navigation.catch((error: unknown) => {
    console.error('Search navigation failed:', error)
    toast.error('Unable to open that result')
  })
}

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { projects } = useCatalog()
  const catalog = projects.length > 0 ? projects : curatedProjects

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((current) => !current)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = useCallback(
    (value: string) => {
      setOpen(false)

      if (value.startsWith('project:')) {
        const id = value.replace('project:', '')
        const project = catalog.find((item) => item.id === id)
        if (!project) return

        if (project.to === '/repos/$repo' && project.repo) {
          runNavigation(
            navigate({
              to: '/repos/$repo',
              params: { repo: project.repo },
              search: { file: undefined, path: undefined },
            }),
          )
          return
        }
        if (project.to === '/discord-themes') {
          runNavigation(
            navigate({
              to: '/discord-themes',
              search: { file: undefined },
            }),
          )
          return
        }
        if (project.to === '/tampermonkey') {
          runNavigation(
            navigate({
              to: '/tampermonkey',
              search: { file: undefined },
            }),
          )
          return
        }
        if (project.to === '/') {
          runNavigation(navigate({ to: '/' }))
          return
        }
        const href = project.href ?? project.githubUrl
        if (href) window.open(href, '_blank', 'noopener,noreferrer')
        return
      }

      if (value.startsWith('folder:')) {
        const folderId = value.replace('folder:', '')
        const folder = folderGroups.find((item) => item.id === folderId)
        if (folder?.href === '/discord-themes') {
          runNavigation(
            navigate({
              to: '/discord-themes',
              search: { file: undefined },
            }),
          )
        } else if (folder?.href === '/tampermonkey') {
          runNavigation(
            navigate({
              to: '/tampermonkey',
              search: { file: undefined },
            }),
          )
        }
        return
      }

      if (value.startsWith('file:')) {
        const filePath = value.replace('file:', '')
        const asset =
          codeLibrary.find((entry) => entry.urlPath === filePath) ?? null
        const topFolderId = asset?.folderSegments[0] ?? null
        const targetFolder =
          (topFolderId
            ? folderGroups.find((folder) => folder.id === topFolderId)
            : null) ?? null

        if (targetFolder?.href === '/tampermonkey') {
          runNavigation(
            navigate({
              to: '/tampermonkey',
              search: { file: filePath },
            }),
          )
          return
        }

        runNavigation(
          navigate({
            to: '/discord-themes',
            search: { file: filePath },
          }),
        )
      }
    },
    [catalog, navigate],
  )

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="size-10 justify-center border-transparent px-0 text-muted-foreground shadow-none lg:w-auto lg:min-w-64 lg:justify-start lg:border-border lg:bg-muted/35 lg:px-3"
      >
        <Search />
        <span className="hidden flex-1 text-left text-xs font-normal lg:inline">
          Search library
        </span>
        <Kbd className="hidden h-5 border bg-background px-1.5 text-[11px] lg:inline-flex">
          Ctrl K
        </Kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search projects, files, and folders"
      >
        <CommandInput placeholder="Search projects and files…" />
        <CommandList>
          <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
            No results found.
          </CommandEmpty>
          <CommandGroup heading="Projects">
            {catalog.map((project) => (
              <CommandItem
                key={project.id}
                value={`project:${project.id} ${project.name} ${project.description}`}
                onSelect={() => handleSelect(`project:${project.id}`)}
                className="gap-3"
              >
                <div className="flex size-6 items-center justify-center rounded bg-primary/10">
                  <GitBranch className="size-3.5 text-primary" />
                </div>
                <span className="font-mono font-medium">{project.name}</span>
                <span className="ml-auto max-w-[40%] truncate text-xs text-muted-foreground">
                  {project.description}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Folders">
            {folderGroups.map((folder) => (
              <CommandItem
                key={folder.id}
                value={`folder:${folder.id}`}
                onSelect={handleSelect}
                className="gap-3"
              >
                <div className="flex size-6 items-center justify-center rounded bg-primary/10">
                  <FolderOpen className="size-3.5 text-primary" />
                </div>
                <span className="font-medium">{folder.title}</span>
                {folder.description ? (
                  <span className="ml-auto max-w-[40%] truncate text-xs text-muted-foreground">
                    {folder.description}
                  </span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Files">
            {codeLibrary.map((asset) => (
              <CommandItem
                key={asset.urlPath}
                value={`file:${asset.urlPath}`}
                onSelect={handleSelect}
                className="gap-3"
              >
                <div className="flex size-6 items-center justify-center rounded bg-primary/10">
                  <FileCode2 className="size-3.5 text-primary" />
                </div>
                <span className="font-medium">{asset.displayName}</span>
                <span className="ml-auto max-w-[40%] truncate text-xs text-muted-foreground">
                  {asset.folderSegments.join('/')}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
