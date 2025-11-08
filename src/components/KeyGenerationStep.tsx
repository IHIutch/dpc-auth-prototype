import React from 'react'

interface KeyGenerationStepProps {
  publicKey: string
  privateKey: string
  publicKeySignature: string
  loading: boolean
  snippet: string
  onGenerateKeyPair: () => void
}

export function KeyGenerationStep({
  publicKey,
  privateKey,
  publicKeySignature,
  loading,
  snippet,
  onGenerateKeyPair
}: KeyGenerationStepProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Step 2: Generate Key Pair</h3>
      </div>
      <div className="p-6">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">DPC Snippet Content:</h4>
          <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600" value={snippet} readOnly />
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors mb-4"
          onClick={onGenerateKeyPair}
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
  )
}