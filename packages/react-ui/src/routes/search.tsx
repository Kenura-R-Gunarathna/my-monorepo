import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import { createFileRoute } from '@tanstack/react-router'
import { createUnifiedTRPCClient } from "../lib/trpc"
import { IconSearch } from '@tabler/icons-react'

export interface DashboardProps {
  data?: DashboardTable[],
}

export const Route = createFileRoute('/search')({
  component: Search,
  staticData: {
    title: 'Search',
    description: 'Manage your account settings and preferences',
    icon: IconSearch,
    group: 'secondary',
    groupOrder: 2,
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

export function Search(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <DataTable data={data} />
  </>)
}
