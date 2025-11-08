import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAccessToken } from '../lib/auth.server'

interface AccessTokenData {
  accessToken: string
}

export function useAccessToken() {
  const queryClient = useQueryClient()

  // Query to get current access token data
  const { data: accessTokenData } = useQuery<AccessTokenData>({
    queryKey: ['accessToken'],
    queryFn: () => {
      return queryClient.getQueryData(['accessToken']) || {
        accessToken: '',
      }
    },
    staleTime: Infinity,
  })

  // Mutation to fetch access token
  const fetchAccessTokenMutation = useMutation({
    mutationFn: async (): Promise<AccessTokenData> => {
      const jwtData = queryClient.getQueryData(['jwt']) as any
      
      if (!jwtData?.jwt) {
        throw new Error('JWT token is required')
      }

      const result = await fetchAccessToken({
        data: { jwt: jwtData.jwt }
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch access token')
      }

      return {
        accessToken: result.accessToken || '',
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accessToken'], data)
    },
  })

  return {
    accessToken: accessTokenData?.accessToken || '',
    fetchAccessToken: fetchAccessTokenMutation.mutate,
    isLoading: fetchAccessTokenMutation.isPending,
    error: fetchAccessTokenMutation.error?.message || '',
  }
}