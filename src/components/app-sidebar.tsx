import * as React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { GalleryVerticalEnd, Minus, Plus } from 'lucide-react'

import { SearchForm } from '@/components/search-form'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { folderGroups } from '@/lib/library'

const overviewLinks = [{ title: 'Home', href: '/' }]

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const folders = React.useMemo(() => folderGroups, [])
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">hapwi library</span>
                  <span className="text-xs text-sidebar-foreground/70">
                    GitHub Pages registry
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm placeholder="Jump to an asset…" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewLinks.map((item) => {
                const isActive = item.href === pathname
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {folders.map((folder) => (
          <SidebarGroup key={folder.id}>
            <SidebarGroupLabel>{folder.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {folder.subfolders.map((subfolder) => {
                  const normalizedHref =
                    subfolder.href?.split('#')[0] ?? undefined
                  const isActive =
                    normalizedHref !== undefined &&
                    pathname === normalizedHref
                  return (
                    <Collapsible
                      key={subfolder.id}
                      defaultOpen={isActive || !subfolder.href}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild={Boolean(subfolder.href)}
                          isActive={isActive}
                          className="justify-between"
                        >
                          {subfolder.href ? (
                            <Link to={normalizedHref ?? '/'}>
                              {subfolder.title}
                            </Link>
                          ) : (
                            <span>{subfolder.title}</span>
                          )}
                        </SidebarMenuButton>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="ml-0">
                            <Plus className="size-4 group-data-[state=open]/collapsible:hidden" />
                            <Minus className="hidden size-4 group-data-[state=open]/collapsible:block" />
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {subfolder.items.map((item) => (
                              <SidebarMenuSubItem key={item.urlPath}>
                                <SidebarMenuSubButton asChild size="sm">
                                  <a
                                    href={item.urlPath}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {item.displayName}
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
