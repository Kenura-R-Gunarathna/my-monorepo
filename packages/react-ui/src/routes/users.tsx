import { createFileRoute } from '@tanstack/react-router'
import { IconUsers } from '@tabler/icons-react'
import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import dashboardData from '../data/dashboard.json'

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
    return { data: dashboardData }
  }
})

export function Users(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <DataTable data={data} />
  </>)
}
