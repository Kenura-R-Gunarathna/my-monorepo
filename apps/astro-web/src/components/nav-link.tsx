import { useEffect, useState } from 'react'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  onClick?: () => void
  icon?: React.ReactNode
}

export function NavLink({ href, children, onClick, icon }: NavLinkProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const checkActive = () => {
      const path = window.location.pathname
      setIsActive(path === href || path.startsWith(href + '/'))
    }
    
    checkActive()
    
    // Listen for navigation events
    window.addEventListener('popstate', checkActive)
    return () => window.removeEventListener('popstate', checkActive)
  }, [href])

  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors mb-2 ${
        isActive 
          ? 'bg-cyan-600 hover:bg-cyan-700' 
          : 'hover:bg-gray-800'
      }`}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </a>
  )
}