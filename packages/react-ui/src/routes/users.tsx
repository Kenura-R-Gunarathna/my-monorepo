import { DataTable } from "../index"
import type { DashboardTable } from "@krag/zod-schema"
import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export interface DashboardProps {
  data?: DashboardTable[],
}

export const Route = createFileRoute('/users')({
  component: Users,
})

export function Users(): React.JSX.Element {
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    fetch('/data/dashboard.json')
      .then((res) => res.json())
      .then((data) => setTableData(data))
      .catch((err) => console.error('Failed to load dashboard data:', err))
  }, [])

  return (
  <>
    <DataTable data={tableData} />
  </>)
}
