import { useForm } from '@tanstack/react-form'
import * as z from 'zod'
import { SNIPPET } from "@/lib/constants"
import { useKeyGeneration } from '@/hooks/useKeyGeneration'

const keyGenerationFormSchema = z.object({
  snippet: z.string().min(1, 'Snippet is required for key verification'),
})

export function KeyGenerationStep() {
  const { publicKey, privateKey, publicKeySignature, generateKeyPair, isLoading, error } = useKeyGeneration()

  const form = useForm({
    defaultValues: {
      snippet: SNIPPET,
    },
    onSubmit: async () => {
      generateKeyPair()
    },
  })
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Step 2: Generate Key Pair</h3>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          onClick={() => form.handleSubmit()}
          disabled={isLoading || !form.state.isValid}
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

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="snippet"
            validators={{
              onBlur: ({ value }) => {
                const result = keyGenerationFormSchema.shape.snippet.safeParse(value)
                return result.success ? undefined : result.error.issues[0]?.message
              },
            }}
            children={(field) => (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label htmlFor={field.name} className="block text-sm font-medium text-blue-900 mb-2">
                  DPC Snippet Content (Required for Key Verification):
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600"
                  value={field.state.value}
                  readOnly
                />
              </div>
            )}
          />
        </form>

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