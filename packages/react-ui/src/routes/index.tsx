import { ChartAreaInteractive, DataTable, SectionCards } from "../index"
import { createFileRoute } from '@tanstack/react-router'
import { createUnifiedTRPCClient } from "../lib/trpc"
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
    const trpcClient = createUnifiedTRPCClient()
    const result = await trpcClient.documents.list.query({ 
      page: 1, 
      pageSize: 10 
    })
    return { data: result.data }
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
