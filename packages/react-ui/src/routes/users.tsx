import { createFileRoute } from '@tanstack/react-router'
import { IconUsers } from '@tabler/icons-react'
import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import { createUnifiedTRPCClient } from "../lib/trpc"

export interface DashboardProps {
  data?: DashboardTable[],
}

export const Route = createFileRoute('/users')({
  component: Users,
  staticData: {
    title: 'Users',
    description: 'Manage user accounts and permissions',
    icon: IconUsers,
    group: 'auth',
    groupOrder: 1,
  },
  loader: async () => {
    const trpcClient = createUnifiedTRPCClient()
    const result = await trpcClient.users.list.query({ 
      page: 1, 
      pageSize: 10 
    })
    return { data: result.data }
  }
})

export function Users(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <DataTable data={data} />
  </>)
}
