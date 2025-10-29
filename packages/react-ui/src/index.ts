// Import styles
import './styles/globals.css';

// Export all UI components
export { Button, buttonVariants } from './components/ui/button';
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardAction, 
  CardDescription, 
  CardContent 
} from './components/ui/card';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Separator } from './components/ui/separator';
export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from './components/ui/field';

// Export additional UI components
export { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
export { Badge, badgeVariants } from './components/ui/badge';
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './components/ui/breadcrumb';
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
} from './components/ui/chart';
export { Checkbox } from './components/ui/checkbox';
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from './components/ui/drawer';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './components/ui/dropdown-menu';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './components/ui/select';
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './components/ui/sheet';
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './components/ui/sidebar';
export { Skeleton } from './components/ui/skeleton';
export { Toaster } from './components/ui/sonner';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './components/ui/table';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
export { Toggle, toggleVariants } from './components/ui/toggle';
export {
  ToggleGroup,
  ToggleGroupItem,
} from './components/ui/toggle-group';
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './components/ui/tooltip';

// Export auth components
export { SigninForm, type SigninFormData } from './components/auth/signin-form';
export { SignupForm, type SignupFormData } from './components/auth/signup-form';

// Export dashboard components
export { AppSidebar } from './components/app-sidebar';
export { ChartAreaInteractive } from './components/chart-area-interactive';
export { Dashboard, type DashboardProps } from './components/Dashboard';
export { DataTable } from './components/data-table';
export { SectionCards } from './components/section-cards';
export { Settings } from './components/Settings';
export { SiteHeader } from './components/site-header';
export { NavDocuments } from './components/nav-documents';
export { NavMain } from './components/nav-main';
export { NavSecondary } from './components/nav-secondary';
export { NavUser } from './components/nav-user';

// Export providers
export { QueryProvider } from './lib/query-provider';

// Export utilities
export { cn } from './lib/utils';

// Export hooks
export { useIsMobile } from './hooks/use-mobile';

// Export context and hooks for navigation
export { NavigationContext, type NavState } from './contexts/navigation-context'
export { NavigationProvider } from './contexts/NavigationContext'
export { useNavigation } from './hooks/use-navigation'
