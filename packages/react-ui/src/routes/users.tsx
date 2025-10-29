import { createFileRoute } from '@tanstack/react-router'
import { IconDatabase } from '@tabler/icons-react'
import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import dashboardData from '../../public/data/dashboard.json'

export interface DashboardProps {
  data?: DashboardTable[],
}

export const Route = createFileRoute('/users')({
  component: Users,
  staticData: {
    title: 'Users',
    description: 'Manage user accounts and permissions',
    icon: IconDatabase,
    group: 'auth',
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
