import { useRouter, useRouterState } from '@tanstack/react-router'
import type { IconProps, Icon } from '@tabler/icons-react'

export interface RouteMetadata {
  title: string
  description: string
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>
  group: 'main' | 'secondary' | 'auth'
  groupOrder: number
}

export interface NavItem {
  title: string
  url: string
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>
  groupOrder: number
}

export function useRouteNavigation() {
  const router = useRouter()
  
  // Get all routes with metadata
  const routes = router.routesById
  const navItems: Record<string, NavItem[]> = {
    navMain: [],
    navSecondary: [],
    auth: [],
  }

  Object.values(routes).forEach((route) => {
    const staticData = route.options?.staticData as RouteMetadata | undefined
    if (staticData) {
      const { title, icon, group, groupOrder } = staticData
      
      const navItem: NavItem = {
        title,
        url: route.to,
        icon: icon,
        groupOrder,
      }

      if (group === 'main') {
        navItems.navMain.push(navItem)
      } else if (group === 'secondary') {
        navItems.navSecondary.push(navItem)
      } else if (group === 'auth') {
        navItems.auth.push(navItem)
      }
    }
  })

  return navItems
}

// Get current page title from router
export function usePageTitle(): string {
  const matches = useRouterState({ select: (state) => state.matches })
  const currentMatch = matches[matches.length - 1]
  
  if (currentMatch?.staticData) {
    return (currentMatch.staticData as RouteMetadata).title
  }
  
  return 'Dashboard'
}
