import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import { createFileRoute } from '@tanstack/react-router'
import dashboardData from '../../public/data/dashboard.json'
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
  },
  loader: async () => {
    return { data: dashboardData }
  }
})

export function Help(): React.JSX.Element {
  const { data } = Route.useLoaderData()

  return (
  <>
    <DataTable data={data} />
  </>)
}
