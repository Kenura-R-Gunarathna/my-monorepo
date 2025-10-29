import { createContext } from 'react'

export interface NavState {
  selectedGroup: string | null
  selectedItem: string | null
  selectedTitle: string
  setSelected: (group: string, item: string, title?: string) => void
}

export const NavigationContext = createContext<NavState | undefined>(undefined)
