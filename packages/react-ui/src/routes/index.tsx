import { ChartAreaInteractive, DataTable, SectionCards } from "../index"
import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

export function Index(): React.JSX.Element {
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    fetch('/data/dashboard.json')
      .then((res) => res.json())
      .then((data) => setTableData(data))
      .catch((err) => console.error('Failed to load dashboard data:', err))
  }, [])

  return (
  <>
    <SectionCards />
    
    <div className="px-4 lg:px-6">
      <ChartAreaInteractive />
    </div>
    
    <DataTable data={tableData} />
  </>)
}
