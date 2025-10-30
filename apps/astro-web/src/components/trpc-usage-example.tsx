// apps/astro-web/src/components/trpc-usage-example.tsx
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTRPC, useTRPCClient } from '../lib/trpc'

/**
 * Example showing the new TanStack React Query integration with tRPC
 * Uses queryOptions() and mutationOptions() factories
 */
export function TRPCUsageExample() {
  const trpc = useTRPC()

  // ✅ Query with queryOptions factory
  const profileQuery = useQuery(
    trpc.user.getProfile.queryOptions()
  )

  // ✅ Query with custom options
  const statsQuery = useQuery({
    ...trpc.user.getStats.queryOptions(),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!profileQuery.data, // Only fetch if profile loaded
  })

  // ✅ Mutation with mutationOptions factory
  const updateProfileMutation = useMutation({
    ...trpc.user.updateProfile.mutationOptions(),
    onSuccess: (data) => {
      console.log('Profile updated:', data)
      // Refetch profile after update
      profileQuery.refetch()
    },
    onError: (error) => {
      console.error('Update failed:', error)
    },
  })

  // ✅ Public query (no auth required)
  const emailCheckQuery = useQuery({
    ...trpc.user.checkEmailExists.queryOptions({ email: 'test@example.com' }),
    enabled: false, // Don't auto-fetch, only on demand
  })

  if (profileQuery.isLoading) {
    return <div>Loading profile...</div>
  }

  if (profileQuery.error) {
    return <div>Error: {profileQuery.error.message}</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>User Profile</h2>
      
      {profileQuery.data && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <p><strong>Name:</strong> {profileQuery.data.name}</p>
          <p><strong>Email:</strong> {profileQuery.data.email}</p>
          <p><strong>Created:</strong> {new Date(profileQuery.data.createdAt).toLocaleDateString()}</p>
        </div>
      )}

      {statsQuery.data && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Statistics</h3>
          <p><strong>Active Sessions:</strong> {statsQuery.data.activeSessions}</p>
          <p><strong>Email Verified:</strong> {statsQuery.data.emailVerified ? '✅' : '❌'}</p>
          <p><strong>Is Active:</strong> {statsQuery.data.isActive ? '✅' : '❌'}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => updateProfileMutation.mutate({ name: 'Updated Name' })}
          disabled={updateProfileMutation.isPending}
          style={{ padding: '8px 16px' }}
        >
          {updateProfileMutation.isPending ? 'Updating...' : 'Update Name'}
        </button>

        <button
          onClick={() => emailCheckQuery.refetch()}
          disabled={emailCheckQuery.isFetching}
          style={{ padding: '8px 16px' }}
        >
          {emailCheckQuery.isFetching ? 'Checking...' : 'Check Email'}
        </button>
      </div>

      {emailCheckQuery.data && (
        <p style={{ marginTop: '10px' }}>
          Email exists: {emailCheckQuery.data.exists ? '✅ Yes' : '❌ No'}
        </p>
      )}
    </div>
  )
}

/**
 * Alternative: Direct usage with tRPC client
 */
export function DirectTRPCExample() {
  const trpcClient = useTRPCClient()

  const handleDirectQuery = async () => {
    try {
      // Direct client call (not reactive, no caching)
      const result = await trpcClient.user.getUserById.query({ id: 'some-id' })
      console.log('User:', result)
    } catch (error) {
      console.error('Query failed:', error)
    }
  }

  return (
    <button onClick={handleDirectQuery}>
      Direct Query Example
    </button>
  )
}
