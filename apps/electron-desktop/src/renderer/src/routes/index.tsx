// will be used later to define routes

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index
})

function Index(): React.JSX.Element {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Electron Desktop App</h1>
      <p className="text-muted-foreground">This route is managed by electron app</p>
    </div>
  )
}
