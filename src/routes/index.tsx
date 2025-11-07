import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { generateJWT, fetchAccessToken, generatePublicKeySignature } from '../lib/auth.server'

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
  const handleGenerateJWT = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!CLIENT_TOKEN || !privateKey || !publicKeyId) {
      setError('Client token, private key, and public key ID are required')
      return
    }

    try {
      setError('')
      setLoading(true)

      const result = await generateJWT({
        data: {
          clientToken: CLIENT_TOKEN,
          publicKeyId,
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

  // Generate public key signature using server function
  // const handleGenerateSignature = async (e: React.FormEvent) => {
  //   e.preventDefault()

  //   if (!privateKey) {
  //     setError('Private key is required for signature generation')
  //     return
  //   }

  //   try {
  //     setError('')
  //     setLoading(true)

  //     const result = await generatePublicKeySignature({
  //       data: { privateKeyPem: privateKey }
  //     })

  //     if (result.success) {
  //       setPublicKeySignature(result.signature || '')
  //     } else {
  //       setError(result.error || 'Failed to generate public key signature')
  //     }

  //   } catch (err) {
  //     setError(`Public key signature generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // Fetch access token using server function
  const handleFetchAccessToken = async (e: React.FormEvent) => {
    e.preventDefault()

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

      <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Step 1: Client Configuration</h3>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="clientToken" className="block text-sm font-medium text-gray-700 mb-2">
              Client Token
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed bg-gray-400/20 text-gray-600"
              id="clientToken"
              value={CLIENT_TOKEN}
              rows={8}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Step 2: Generate Key Pair</h3>
        </div>
        <div className="p-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">DPC Snippet Content:</h4>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600" value={SNIPPET} readOnly />
          </div>

          <button
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors mb-4"
            onClick={generateKeyPair}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate RSA 4096 Key Pair'}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Public Key (PEM)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600"
                rows={8}
                value={publicKey}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Private Key (PEM)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600"
                rows={8}
                value={privateKey}
                readOnly
              />
            </div>
            <div className='col-span-2'>
              <label className="block text-sm font-medium text-gray-700 mb-2">Public Key Signature (Base64)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600"
                rows={4}
                value={publicKeySignature}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Step 2.5: Generate Public Key Signature</h3>
        </div>
        <div className="p-6">


          <form onSubmit={handleGenerateSignature}>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors mb-4"
              disabled={loading || !privateKey}
            >
              {loading ? 'Generating...' : 'Generate Public Key Signature (SHA-256)'}
            </button>
          </form>
        </div>
      </div> */}

      <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Step 3: Generate JWT</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleGenerateJWT}>
            <div className="mb-4">
              <label htmlFor="publicKeyId" className="block text-sm font-medium text-gray-700 mb-2">
                Public Key ID
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                id="publicKeyId"
                value={publicKeyId}
                onChange={(e) => setPublicKeyId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors mb-4"
              disabled={loading || !CLIENT_TOKEN || !publicKeyId}
            >
              {loading ? 'Generating...' : 'Generate JWT (RS384)'}
            </button>
          </form>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">JWT Token</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600"
              rows={4}
              value={jwt}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Step 4: Fetch Access Token</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleFetchAccessToken}>
            <button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors mb-4"
              disabled={loading || !jwt}
            >
              {loading ? 'Fetching...' : 'Fetch Access Token'}
            </button>
          </form>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Token Response</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600"
              rows={6}
              value={accessToken}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    keyPair: CryptoKeyPair
  }
}