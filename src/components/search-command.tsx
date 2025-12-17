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
        className="hidden h-8 gap-2 px-2 text-muted-foreground hover:text-foreground sm:flex"
        aria-label="Search"
      >
        <Search className="size-4" />
        <span className="text-xs text-muted-foreground">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 p-0 text-muted-foreground hover:text-foreground sm:hidden"
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
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Folders">
            {folderGroups.map((folder) => (
              <CommandItem
                key={folder.id}
                value={`folder:${folder.id}`}
                onSelect={handleSelect}
              >
                <FolderOpen className="size-4 text-blue-500" />
                <span>{folder.title}</span>
                {folder.description && (
                  <span className="ml-2 text-xs text-muted-foreground truncate">
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
              >
                <FileCode2 className="size-4 text-purple-500" />
                <span>{asset.displayName}</span>
                <span className="ml-2 text-xs text-muted-foreground truncate">
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
