// Import styles
import '@/packages/react-ui/styles/globals.css';

// Export all UI components
export { Button, buttonVariants } from '@/packages/react-ui/components/ui/button';
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardAction, 
  CardDescription, 
  CardContent 
} from '@/packages/react-ui/components/ui/card';
export { Input } from '@/packages/react-ui/components/ui/input';
export { Label } from '@/packages/react-ui/components/ui/label';
export { Separator } from '@/packages/react-ui/components/ui/separator';
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
} from '@/packages/react-ui/components/ui/field';

// Export additional UI components
export { Avatar, AvatarImage, AvatarFallback } from '@/packages/react-ui/components/ui/avatar';
export { Badge, badgeVariants } from '@/packages/react-ui/components/ui/badge';
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/packages/react-ui/components/ui/breadcrumb';
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
} from '@/packages/react-ui/components/ui/chart';
export { Checkbox } from '@/packages/react-ui/components/ui/checkbox';
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
} from '@/packages/react-ui/components/ui/drawer';
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
} from '@/packages/react-ui/components/ui/dropdown-menu';
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
} from '@/packages/react-ui/components/ui/select';
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/packages/react-ui/components/ui/sheet';
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
} from '@/packages/react-ui/components/ui/sidebar';
export { Skeleton } from '@/packages/react-ui/components/ui/skeleton';
export { Toaster } from '@/packages/react-ui/components/ui/sonner';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/packages/react-ui/components/ui/table';
export { Tabs, TabsList, TabsTrigger, TabsContent } from '@/packages/react-ui/components/ui/tabs';
export { Toggle, toggleVariants } from '@/packages/react-ui/components/ui/toggle';
export {
  ToggleGroup,
  ToggleGroupItem,
} from '@/packages/react-ui/components/ui/toggle-group';
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/packages/react-ui/components/ui/tooltip';

// Export auth components
export { LoginForm, type LoginFormData } from '@/packages/react-ui/components/auth/login-form';
export { SignupForm } from '@/packages/react-ui/components/auth/signup-form';

// Export dashboard components
export { Dashboard } from '@/packages/react-ui/components/Dashboard';
export { AppSidebar } from '@/packages/react-ui/components/app-sidebar';
export { ChartAreaInteractive } from '@/packages/react-ui/components/chart-area-interactive';
export { DataTable } from '@/packages/react-ui/components/data-table';
export { SectionCards } from '@/packages/react-ui/components/section-cards';
export { SiteHeader } from '@/packages/react-ui/components/site-header';
export { NavDocuments } from '@/packages/react-ui/components/nav-documents';
export { NavMain } from '@/packages/react-ui/components/nav-main';
export { NavSecondary } from '@/packages/react-ui/components/nav-secondary';
export { NavUser } from '@/packages/react-ui/components/nav-user';

// Export providers
export { QueryProvider } from '@/packages/react-ui/lib/query-provider';

// Export utilities
export { cn } from '@/packages/react-ui/lib/utils';

// Export hooks
export { useIsMobile } from '@/packages/react-ui/hooks/use-mobile';
