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

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = selectedGroup === 'navSecondary' && selectedItem === item.title
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild
                  isActive={isActive}
                >
                  {LinkComponent ? (
                    <LinkComponent 
                      to={item.url} 
                      onClick={() => setSelected('navSecondary', item.title, item.title)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </LinkComponent>
                  ) : (
                    <a 
                      href={item.url} 
                      onClick={() => setSelected('navSecondary', item.title, item.title)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
