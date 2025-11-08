import React from 'react'

interface JWTGenerationStepProps {
  publicKeyId: string
  jwt: string
  loading: boolean
  clientToken: string
  onGenerateJWT: (e: React.FormEvent) => void
  setPublicKeyId: (id: string) => void
}

export function JWTGenerationStep({
  publicKeyId,
  jwt,
  loading,
  clientToken,
  onGenerateJWT,
  setPublicKeyId
}: JWTGenerationStepProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Step 3: Generate JWT</h3>
      </div>
      <div className="p-6">
        <form onSubmit={onGenerateJWT}>
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
            disabled={loading || !clientToken || !publicKeyId}
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
  )
}