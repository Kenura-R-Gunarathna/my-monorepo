import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import { createFileRoute } from '@tanstack/react-router'
import { createUnifiedTRPCClient } from "../lib/trpc"
import { IconSettings } from '@tabler/icons-react'

export interface DashboardProps {
  data?: DashboardTable[],
}

export const Route = createFileRoute('/settings')({
  component: Settings,
  staticData: {
    title: 'Settings',
    description: 'Manage your account settings and preferences',
    icon: IconSettings,
    group: 'secondary',
    groupOrder: 3,
  },
  loader: async () => {
    const trpcClient = createUnifiedTRPCClient()
    const result = await trpcClient.settings.list.query({ 
      page: 1, 
      pageSize: 10 
    })
    return { data: result.data }
  }
})

export function Settings(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <DataTable data={data} />
  </>)
}
