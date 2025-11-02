import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import { createFileRoute } from '@tanstack/react-router'
import { createUnifiedTRPCClient } from "../lib/trpc"
import { IconHelp } from '@tabler/icons-react'

export interface DashboardProps {
  data?: DashboardTable[],
}

export const Route = createFileRoute('/help')({
  component: Help,
  staticData: {
    title: 'Help',
    description: 'Get help and support for your account',
    icon: IconHelp,
    group: 'secondary',
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

export function Help(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <DataTable data={data} />
  </>)
}
