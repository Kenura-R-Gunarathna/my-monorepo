"use client"

import * as React from "react"
import { type Icon } from "@tabler/icons-react"
import type { ComponentType, ReactNode } from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { useNavigation } from "../hooks/use-navigation"

export function NavSecondary({
  items,
  LinkComponent,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
  LinkComponent?: ComponentType<{ to: string; children: ReactNode; onClick?: () => void }>
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { selectedGroup, selectedItem, setSelected } = useNavigation()

  // Use provided LinkComponent or fallback to anchor tag
  const NavLink = LinkComponent || (({ to, children, onClick }: { to: string; children: ReactNode; onClick?: () => void }) => (
    <a href={to} onClick={onClick}>{children}</a>
  ))

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild
                isActive={selectedGroup === 'navSecondary' && selectedItem === item.title}
              >
                <NavLink to={item.url} onClick={() => setSelected('navSecondary', item.title, item.title)}>
                  <item.icon />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
