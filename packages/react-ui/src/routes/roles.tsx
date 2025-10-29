import { createFileRoute } from '@tanstack/react-router'
import { IconBriefcase } from '@tabler/icons-react'
import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import dashboardData from '../data/dashboard.json'

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
