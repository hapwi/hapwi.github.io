import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FileCode2, FolderOpen, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { codeLibrary, folderGroups } from '@/lib/library'

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = useCallback(
    (value: string) => {
      setOpen(false)

      if (value.startsWith('folder:')) {
        const folderId = value.replace('folder:', '')
        const folder = folderGroups.find((f) => f.id === folderId)
        if (folder?.href) {
          navigate({ to: folder.href })
        }
      } else if (value.startsWith('file:')) {
        const filePath = value.replace('file:', '')
        const asset = codeLibrary.find((entry) => entry.urlPath === filePath) ?? null
        const topFolderId = asset?.folderSegments[0] ?? null
        const targetFolder =
          (topFolderId
            ? folderGroups.find((folder) => folder.id === topFolderId)
            : null) ?? null

        const targetPath = targetFolder?.href ?? '/discord-themes'

        navigate({ to: targetPath, search: { file: filePath } })
      }
    },
    [navigate]
  )

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden h-9 gap-2.5 rounded-md border border-border/50 bg-muted/30 px-3 text-muted-foreground hover:bg-muted hover:text-foreground md:flex"
        aria-label="Search"
      >
        <Search className="size-4" />
        <span className="text-sm">Search</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 p-0 text-muted-foreground hover:text-foreground md:hidden"
        aria-label="Search"
      >
        <Search className="size-4" />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search for files and folders"
      >
        <CommandInput placeholder="Search files and folders..." />
        <CommandList>
          <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
            No results found.
          </CommandEmpty>
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
                {folder.description && (
                  <span className="ml-auto text-xs text-muted-foreground truncate max-w-[40%]">
                    {folder.description}
                  </span>
                )}
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
                <div className="flex size-6 items-center justify-center rounded bg-violet-500/10">
                  <FileCode2 className="size-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="font-medium">{asset.displayName}</span>
                <span className="ml-auto text-xs text-muted-foreground truncate max-w-[40%]">
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
