import { createFileRoute } from '@tanstack/react-router'
import { IconReport } from '@tabler/icons-react'
import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import dashboardData from '../../public/data/dashboard.json'

export interface DashboardProps {
  data?: DashboardTable[],
}

export const Route = createFileRoute('/roles')({
  component: Roles,
  staticData: {
    title: 'Roles',
    description: 'Define and manage user roles',
    icon: IconReport,
    group: 'auth',
  },
  loader: async () => {
    return { data: dashboardData }
  }
})

export function Roles(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <DataTable data={data} />
  </>)
}
