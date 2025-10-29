import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import { createFileRoute } from '@tanstack/react-router'
import dashboardData from '../data/dashboard.json'
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
    return { data: dashboardData }
  }
})

export function Search(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <DataTable data={data} />
  </>)
}
