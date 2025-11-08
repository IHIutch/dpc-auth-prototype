import { useState } from 'react'
import { SNIPPET } from "@/lib/constants"
import { useDPC } from '@/contexts/DPCContext'
import { generatePublicKeySignature } from '@/lib/auth.client'

export function KeyGenerationStep() {
  const { publicKey, privateKey, publicKeySignature, setData } = useDPC()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateKeyPair = async () => {
    setIsLoading(true)
    setError('')
    try {
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
      const signature = await generatePublicKeySignature({ privateKeyPem })

      setData(prev => ({
        ...prev,
        publicKey: publicKeyPem,
        privateKey: privateKeyPem,
        publicKeySignature: signature,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Step 2: Generate Key Pair</h3>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          onClick={handleGenerateKeyPair}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate RSA 4096 Key Pair'}
        </button>
      </div>
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">DPC Snippet Content:</h4>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600"
            value={SNIPPET}
            readOnly
          />
        </div>

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
              rows={5}
              value={publicKeySignature}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  )
}