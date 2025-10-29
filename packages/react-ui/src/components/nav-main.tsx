import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react"
import { useState, type ComponentType, type ReactNode } from "react"

import { Button } from "./ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { useNavigation } from "../hooks/use-navigation"

const quickCreateItems = [
  { title: "User", description: "Create a new user account" },
  { title: "Role", description: "Define a new role" },
  { title: "Permission", description: "Add a new permission" },
  { title: "Project", description: "Start a new project" },
  { title: "Team", description: "Create a team" },
]

export function NavMain({
  items,
  LinkComponent,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
  LinkComponent?: ComponentType<{ to: string; children: ReactNode; onClick?: () => void }>
}) {
  
  const { selectedGroup, selectedItem, setSelected } = useNavigation()
  const [sheetOpen, setSheetOpen] = useState(false)

  // Use provided LinkComponent or fallback to anchor tag
  const NavLink = LinkComponent || (({ to, children, onClick }: { to: string; children: ReactNode; onClick?: () => void }) => (
    <a href={to} onClick={onClick}>{children}</a>
  ))

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span>Quick Create</span>
                </SidebarMenuButton>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Quick Create</SheetTitle>
                  <SheetDescription>
                    Choose what you'd like to create
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {quickCreateItems.map((item) => (
                    <Button
                      key={item.title}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => {
                        setSheetOpen(false)
                        // Handle navigation here
                      }}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild
                isActive={selectedGroup === 'navMain' && selectedItem === item.title}
                tooltip={item.title}
              >
                <NavLink to={item.url} onClick={() => setSelected('navMain', item.title, item.title)}>
                  {item.icon && <item.icon />}
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
