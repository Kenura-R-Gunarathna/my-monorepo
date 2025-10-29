"use client"

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from "@tabler/icons-react"
import type { ComponentType, ReactNode } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar"
import { useNavigation } from "../hooks/use-navigation"

export function NavDocuments({
  items,
  LinkComponent,
}: {
  items: {
    name: string
    url: string
    icon: Icon
  }[]
  LinkComponent?: ComponentType<{ to: string; children: ReactNode; onClick?: () => void }>
}) {
  const { isMobile } = useSidebar()
  const { selectedGroup, selectedItem, setSelected } = useNavigation()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = selectedGroup === 'navDocuments' && selectedItem === item.name
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild
                isActive={isActive}
              >
                {LinkComponent ? (
                  <LinkComponent 
                    to={item.url} 
                    onClick={() => setSelected('navDocuments', item.name, item.name)}
                  >
                    <item.icon />
                    <span>{item.name}</span>
                  </LinkComponent>
                ) : (
                  <a 
                    href={item.url} 
                    onClick={() => setSelected('navDocuments', item.name, item.name)}
                  >
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                )}
              </SidebarMenuButton>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="data-[state=open]:bg-accent rounded-sm"
                >
                  <IconDots />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <IconFolder />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconShare3 />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <IconTrash />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <IconDots className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
