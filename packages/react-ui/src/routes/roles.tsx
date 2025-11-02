import { createFileRoute } from '@tanstack/react-router'
import { IconBriefcase } from '@tabler/icons-react'
import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import { createUnifiedTRPCClient } from "../lib/trpc"

export interface DashboardProps {
  data?: DashboardTable[],
}

export const Route = createFileRoute('/roles')({
  component: Roles,
  staticData: {
    title: 'Roles',
    description: 'Define and manage user roles',
    icon: IconBriefcase,
    group: 'auth',
    groupOrder: 2,
  },
  loader: async () => {
    const trpcClient = createUnifiedTRPCClient()
    const result = await trpcClient.roles.list.query({ 
      page: 1, 
      pageSize: 10 
    })
    return { data: result.data }
  }
})

export function Roles(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <DataTable data={data} />
  </>)
}
