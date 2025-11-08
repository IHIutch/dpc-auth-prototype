import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generatePublicKeySignature } from '../lib/auth.server'

interface KeyPairData {
  publicKey: string
  privateKey: string
  publicKeySignature: string
}

export function useKeyGeneration() {
  const queryClient = useQueryClient()

  // Query to get current key pair data
  const { data: keyPairData } = useQuery<KeyPairData>({
    queryKey: ['keyPair'],
    queryFn: () => {
      // Return existing data from cache or empty state
      return queryClient.getQueryData(['keyPair']) || {
        publicKey: '',
        privateKey: '',
        publicKeySignature: '',
      }
    },
    staleTime: Infinity, // Never stale - persist until manually updated
  })

  // Mutation to generate new key pair
  const generateKeyPairMutation = useMutation({
    mutationFn: async (): Promise<KeyPairData> => {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-384',
        },
        true,
        ['sign', 'verify']
      )

      // Export public key
      const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey)
      const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)))
      const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`

      // Export private key
      const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
      const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)))
      const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`

      // Generate public key signature
      const result = await generatePublicKeySignature({
        data: { privateKeyPem }
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate public key signature')
      }

      return {
        publicKey: publicKeyPem,
        privateKey: privateKeyPem,
        publicKeySignature: result.signature || '',
      }
    },
    onSuccess: (data) => {
      // Update the cache with new key pair data
      queryClient.setQueryData(['keyPair'], data)
    },
  })

  return {
    publicKey: keyPairData?.publicKey || '',
    privateKey: keyPairData?.privateKey || '',
    publicKeySignature: keyPairData?.publicKeySignature || '',
    generateKeyPair: generateKeyPairMutation.mutate,
    isLoading: generateKeyPairMutation.isPending,
    error: generateKeyPairMutation.error?.message || '',
  }
}