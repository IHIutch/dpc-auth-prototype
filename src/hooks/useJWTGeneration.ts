import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateJWT } from '../lib/auth.server'
import { CLIENT_TOKEN } from '@/lib/constants'

interface JWTData {
  jwt: string
  publicKeyId: string
}

export function useJWTGeneration() {
  const queryClient = useQueryClient()

  // Query to get current JWT data
  const { data: jwtData } = useQuery<JWTData>({
    queryKey: ['jwt'],
    queryFn: () => {
      return queryClient.getQueryData(['jwt']) || {
        jwt: '',
        publicKeyId: '',
      }
    },
    staleTime: Infinity,
  })

  // Mutation to generate JWT
  const generateJWTMutation = useMutation({
    mutationFn: async ({ publicKeyId }: { publicKeyId: string }): Promise<JWTData> => {
      const keyPairData = queryClient.getQueryData(['keyPair']) as any

      if (!keyPairData?.privateKey || !publicKeyId) {
        throw new Error('Client token, private key, and public key ID are required')
      }

      const result = await generateJWT({
        data: {
          clientToken: CLIENT_TOKEN,
          publicKeyId,
          privateKeyPem: keyPairData.privateKey,
        }
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate JWT')
      }

      return {
        jwt: result.jwt || '',
        publicKeyId,
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['jwt'], data)
    },
  })

  // Function to update public key ID
  const setPublicKeyId = (publicKeyId: string) => {
    const currentData = queryClient.getQueryData(['jwt']) as JWTData || { jwt: '', publicKeyId: '' }
    queryClient.setQueryData(['jwt'], { ...currentData, publicKeyId })
  }

  return {
    jwt: jwtData?.jwt || '',
    publicKeyId: jwtData?.publicKeyId || '',
    clientToken: CLIENT_TOKEN,
    generateJWT: generateJWTMutation.mutate,
    setPublicKeyId,
    isLoading: generateJWTMutation.isPending,
    error: generateJWTMutation.error?.message || '',
  }
}