import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { generateJWT, fetchAccessToken, generatePublicKeySignature } from '../lib/auth.server'
import { ClientTokenStep } from '@/components/ClientTokenStep'
import { KeyGenerationStep } from '@/components/KeyGenerationStep'
import { JWTGenerationStep } from '@/components/JWTGenerationStep'
import { AccessTokenStep } from '@/components/AccessTokenStep'

const CLIENT_TOKEN = `W3sidiI6MiwibCI6Imh0dHBzOi8vc2FuZGJveC5kcGMuY21zLmdvdi9hcGkiLCJpIjoiMTU2OGQwMTItOWJhNC00NWI5LTg0YTctYmRlNzMxNDA2Yjg3IiwiYyI6W3siaTY0IjoiWkhCalgyMWhZMkZ5YjI5dVgzWmxjbk5wYjI0Z1BTQXkifSx7Imk2NCI6IlpYaHdhWEpsY3lBOUlESXdNall0TVRBdE1qVlVNakU2TWpRNk1ETXVNemN3TmpFeldnIn0seyJpNjQiOiJiM0puWVc1cGVtRjBhVzl1WDJsa0lEMGdabU5oTmpkbFlqVXRZVEU1WXkwME9UQmtMVGhoT0dVdFlqQmpOREZpTVRFMVl6YzUifSx7ImwiOiJsb2NhbCIsImk2NCI6IkFxQ0JhSHFnZ1doNmV0cjJmRnRhalg2RWNNaUktUGUydkNGaWNNZjltal9Wcnp0OEJTNjhpamhUOFh4c3oxMHVWQTY2LXRlbXdKZ2JVZmlNYWVhUENyMG1BSWVKYkhqbkRJenFKZUhaR2Vudlo0Sm1JamRfV2Fmc2NXZnJuRUZnaC0wT3JkZ204YVh3alVaUFRjOVgxOXg5M0MyN3NkekFZNU56NGsyUkRJU1VYZWxSYWlzZHhaemVVZ2p0aENtTkJRWC1LcXN0djFPaVVENERqQSIsInY2NCI6IlAwOWRNeWRhMGNBN3kzUTc1RUJpUUJEMUpRMC16eURsUzlvd0xxd0R0SVlUQ2plT3J1OFRITDA1c1kzemdRbkw3WGNQT1NMMHFfaGdFVWxYWFpYUEwtT19FdWdqdWhWZiJ9XSwiczY0IjoicGtCdUkzOTVGSk1XanllR2hpM19CT2hPa09UX294RmV0NEF5bm1WVHI5OCJ9XQ==`
// const PUBLIC_KEY_ID = 'bf7eb4ce-ca9e-49ca-9273-315650da1649'
const SNIPPET = 'This is the snippet used to verify a key pair in DPC.'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [publicKey, setPublicKey] = React.useState('')
  const [privateKey, setPrivateKey] = React.useState('')
  const [publicKeyId, setPublicKeyId] = React.useState('')
  const [jwt, setJwt] = React.useState('')
  const [accessToken, setAccessToken] = React.useState('')
  const [publicKeySignature, setPublicKeySignature] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  // Generate public/private key pair using Web Crypto API
  const generateKeyPair = async () => {
    try {
      setError('')
      setLoading(true)

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

      setPublicKey(publicKeyPem)
      setPrivateKey(privateKeyPem)
      // setPublicKeyId(Math.random().toString(36).substring(2, 15))

      // Store the key pair for JWT signing
      // window.keyPair = keyPair

      const result = await generatePublicKeySignature({
        data: { privateKeyPem: privateKey }
      })

      if (result.success) {
        setPublicKeySignature(result.signature || '')
      } else {
        setError(result.error || 'Failed to generate public key signature')
      }

    } catch (err) {
      setError(`Key generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Generate JWT token using server function
  const handleGenerateJWT = async (data: { publicKeyId: string }) => {
    if (!CLIENT_TOKEN || !privateKey || !data.publicKeyId) {
      setError('Client token, private key, and public key ID are required')
      return
    }

    try {
      setError('')
      setLoading(true)

      const result = await generateJWT({
        data: {
          clientToken: CLIENT_TOKEN,
          publicKeyId: data.publicKeyId,
          privateKeyPem: privateKey,
        }
      })

      if (result.success) {
        setJwt(result.jwt || '')
      } else {
        setError(result.error || 'Failed to generate JWT')
      }

    } catch (err) {
      setError(`JWT generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Fetch access token using server function
  const handleFetchAccessToken = async () => {
    if (!jwt) {
      setError('JWT token is required')
      return
    }

    try {
      setError('')
      setLoading(true)

      const result = await fetchAccessToken({
        data: { jwt }
      })

      if (result.success) {
        setAccessToken(result.accessToken)
      } else {
        setError(result.error || 'Failed to fetch access token')
      }

    } catch (err) {
      setError(`Access token fetch failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">DPC Authorization Prototype</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <ClientTokenStep clientToken={CLIENT_TOKEN} />

      <KeyGenerationStep
        publicKey={publicKey}
        privateKey={privateKey}
        publicKeySignature={publicKeySignature}
        loading={loading}
        snippet={SNIPPET}
        onGenerateKeyPair={generateKeyPair}
      />

      <JWTGenerationStep
        publicKeyId={publicKeyId}
        jwt={jwt}
        loading={loading}
        clientToken={CLIENT_TOKEN}
        onGenerateJWT={handleGenerateJWT}
        setPublicKeyId={setPublicKeyId}
      />

      <AccessTokenStep
        jwt={jwt}
        accessToken={accessToken}
        loading={loading}
        onFetchAccessToken={handleFetchAccessToken}
      />
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    keyPair: CryptoKeyPair
  }
}