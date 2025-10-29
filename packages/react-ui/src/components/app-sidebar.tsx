import * as React from "react"
import { IconInnerShadowTop } from "@tabler/icons-react"
import { useRouteNavigation, type NavItem } from "../lib/route-utils"
import { NavDocuments } from "./nav-documents"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"

export interface AllRouteMetadata {
  user: {
    name: string
    email: string
    avatar: string
  }
  navMain: NavItem[]
  auth: NavItem[]
  navSecondary: NavItem[]
}

const staticData: AllRouteMetadata = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [],
  auth: [],
  navSecondary: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const routeNav = useRouteNavigation()

  const mergeAndSort = (target: NavItem[], source: NavItem[]) => {
    target.push(...source)
    target.sort((a, b) => a.groupOrder - b.groupOrder)
  }

  mergeAndSort(routeNav.navMain, staticData.navMain)
  mergeAndSort(routeNav.auth, staticData.auth)
  mergeAndSort(routeNav.navSecondary, staticData.navSecondary)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">KRAG Tech</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={routeNav.navMain} />
        <NavDocuments items={routeNav.auth} maxVisible={6} />
        <NavSecondary items={routeNav.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={staticData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
