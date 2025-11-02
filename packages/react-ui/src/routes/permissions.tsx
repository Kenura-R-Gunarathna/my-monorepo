import { createFileRoute } from '@tanstack/react-router'
import { IconChecklist } from '@tabler/icons-react'
import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import { createUnifiedTRPCClient } from "../lib/trpc"

export interface DashboardProps {
  data?: DashboardTable[],
}

export const Route = createFileRoute('/permissions')({
  component: Permissions,
  staticData: {
    title: 'Permissions',
    description: 'Manage system permissions and access control',
    icon: IconChecklist,
    group: 'auth',
    groupOrder: 3,
  },
    loader: async () => {
      const trpcClient = createUnifiedTRPCClient()
      const result = await trpcClient.permissions.list.query({ 
        page: 1, 
        pageSize: 10 
      })
      return { data: result.data }
    }
})

export function Permissions(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <DataTable data={data} />
  </>)
}
