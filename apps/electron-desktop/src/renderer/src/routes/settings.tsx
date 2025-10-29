import { createFileRoute } from '@tanstack/react-router'
import { Settings } from '@krag/react-ui'

export const Route = createFileRoute('/settings')({
  component: SettingsPage
})

function SettingsPage(): React.JSX.Element {
  return <Settings />
}
