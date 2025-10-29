import { ChartAreaInteractive, DataTable, SectionCards } from "../index"
import { createFileRoute } from '@tanstack/react-router'
import dashboardData from '../../public/data/dashboard.json'
import { IconDashboard } from '@tabler/icons-react'

export const Route = createFileRoute('/')({
  component: Index,
  staticData: {
    title: 'Dashboard',
    description: 'View your dashboard overview and analytics',
    icon: IconDashboard,
    group: 'main',
    groupOrder: 1,
  },
  loader: async () => {
    return { data: dashboardData }
  }
})

export function Index(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <SectionCards />
    
    <div className="px-4 lg:px-6">
      <ChartAreaInteractive />
    </div>
    
    <DataTable data={data} />
  </>)
}
