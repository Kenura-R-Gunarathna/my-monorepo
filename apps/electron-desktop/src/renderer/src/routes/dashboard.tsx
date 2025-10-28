import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@krag/react-ui'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage(): React.JSX.Element {
  return <Dashboard />
}
