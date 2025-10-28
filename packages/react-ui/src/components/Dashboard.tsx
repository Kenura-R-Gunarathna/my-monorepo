import { AppSidebar } from "@/packages/react-ui/components/app-sidebar"
import { ChartAreaInteractive } from "@/packages/react-ui/components/chart-area-interactive"
import { DataTable } from "@/packages/react-ui/components/data-table"
import { SectionCards } from "@/packages/react-ui/components/section-cards"
import { SiteHeader } from "@/packages/react-ui/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/packages/react-ui/components/ui/sidebar"

import data from "@/packages/react-ui/data/dashboard.json"

export interface DashboardProps {
  /**
   * Custom data for the data table. If not provided, uses default dashboard data.
   */
  data?: typeof data
}

export function Dashboard({ data: customData }: DashboardProps = {}) {
  const tableData = customData || data

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={tableData} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
