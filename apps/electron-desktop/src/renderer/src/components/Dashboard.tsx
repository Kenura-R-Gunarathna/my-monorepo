import {
  AppSidebar,
  ChartAreaInteractive,
  DataTable,
  SectionCards,
  SiteHeader,
  SidebarInset,
  SidebarProvider
} from '@krag/react-ui'
import type { DashboardTable } from '@krag/zod-schema'

export interface DashboardProps {
  data?: DashboardTable[]
  showStats?: boolean
}

export function Dashboard({
  data: customData,
  showStats = false
}: DashboardProps = {}): React.JSX.Element {
  const tableData = customData || []

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)'
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {showStats && (
                <>
                  <SectionCards />
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                  </div>
                </>
              )}

              <DataTable data={tableData} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
