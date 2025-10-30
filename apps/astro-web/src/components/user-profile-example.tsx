// apps/astro-web/src/components/user-profile-example.tsx
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTRPC } from '../lib/trpc'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@krag/react-ui'

/**
 * Example component demonstrating tRPC usage with TanStack React Query
 * Shows how to query and mutate data using the new integration pattern
 */
export function UserProfileExample() {
  const trpc = useTRPC()

  // Query user profile
  const { data: profile, isLoading, error, refetch } = useQuery(
    trpc.user.getProfile.queryOptions()
  )

  // Query user stats
  const { data: stats } = useQuery(
    trpc.user.getStats.queryOptions()
  )

  // Mutation for updating profile
  const updateProfile = useMutation({
    ...trpc.user.updateProfile.mutationOptions(),
    onSuccess: () => {
      // Refetch profile after successful update
      refetch()
    },
  })

  if (isLoading) {
    return <div>Loading profile...</div>
  }

  if (error) {
    return <div>Error loading profile: {error.message}</div>
  }

  if (!profile) {
    return <div>No profile found</div>
  }

  const handleUpdateName = () => {
    updateProfile.mutate({
      name: 'Updated Name',
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>Name:</strong> {profile.name}
          </div>
          <div>
            <strong>Email:</strong> {profile.email}
          </div>
          <div>
            <strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}
          </div>
          <Button 
            onClick={handleUpdateName} 
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? 'Updating...' : 'Update Name'}
          </Button>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Active Sessions:</strong> {stats.activeSessions}
            </div>
            <div>
              <strong>Email Verified:</strong> {stats.emailVerified ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>IS Active:</strong> {stats.isActive ? 'Yes' : 'No'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
