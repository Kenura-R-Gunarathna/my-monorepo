import { createFileRoute } from '@tanstack/react-router'
import { IconFileWord } from '@tabler/icons-react'
import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import dashboardData from '../../public/data/dashboard.json'

export interface DashboardProps {
  data?: DashboardTable[],
}

export const Route = createFileRoute('/permissions')({
  component: Permissions,
  staticData: {
    title: 'Permissions',
    description: 'Manage system permissions and access control',
    icon: IconFileWord,
    group: 'auth',
  },
    loader: async () => {
      return { data: dashboardData }
    }
})

export function Permissions(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <DataTable data={data} />
  </>)
}
