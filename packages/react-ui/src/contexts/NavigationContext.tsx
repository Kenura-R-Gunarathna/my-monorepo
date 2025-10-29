import { useState, useEffect, type ReactNode } from 'react'
import { NavigationContext } from './navigation-context'

// Detect if running in Electron
interface WindowWithElectron extends Window {
  electron?: unknown
}

const isElectron = typeof window !== 'undefined' && 
  ((window as WindowWithElectron).electron !== undefined || navigator.userAgent.includes('Electron'))

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(() => {
    if (isElectron && typeof localStorage !== 'undefined') {
      return localStorage.getItem('selectedGroup')
    }
    return null
  })
  
  const [selectedItem, setSelectedItem] = useState<string | null>(() => {
    if (isElectron && typeof localStorage !== 'undefined') {
      return localStorage.getItem('selectedItem')
    }
    return null
  })

  const [selectedTitle, setSelectedTitle] = useState<string>(() => {
    if (isElectron && typeof localStorage !== 'undefined') {
      return localStorage.getItem('selectedTitle') || 'Dashboard'
    }
    return 'Dashboard'
  })

  useEffect(() => {
    if (isElectron && typeof localStorage !== 'undefined') {
      if (selectedGroup) localStorage.setItem('selectedGroup', selectedGroup)
      if (selectedItem) localStorage.setItem('selectedItem', selectedItem)
      if (selectedTitle) localStorage.setItem('selectedTitle', selectedTitle)
    }
  }, [selectedGroup, selectedItem, selectedTitle])

  const setSelected = (group: string, item: string, title?: string) => {
    setSelectedGroup(group)
    setSelectedItem(item)
    if (title) {
      setSelectedTitle(title)
    }
  }

  return (
    <NavigationContext.Provider value={{ selectedGroup, selectedItem, selectedTitle, setSelected }}>
      {children}
    </NavigationContext.Provider>
  )
}