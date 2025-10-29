import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@krag/react-ui'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/users')({
  component: Users
})

function Users(): React.JSX.Element {
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    fetch('/data/dashboard.json')
      .then((res) => res.json())
      .then((data) => setTableData(data))
      .catch((err) => console.error('Failed to load dashboard data:', err))
  }, [])

  return <Dashboard data={tableData} showStats={false} />
}
