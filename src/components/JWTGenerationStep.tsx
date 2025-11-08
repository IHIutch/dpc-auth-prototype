import { useForm } from '@tanstack/react-form'
import { useDPC } from '@/contexts/DPCContext'
import { generateJWT } from '@/lib/auth.client'
import { CLIENT_TOKEN } from '@/lib/constants'

export function JWTGenerationStep() {
  const { publicKeyId, jwt, privateKey, setData } = useDPC()

  const form = useForm({
    defaultValues: {
      publicKeyId: publicKeyId,
    },
    onSubmit: async ({ value }) => {
      if (!privateKey) {
        throw new Error('Private key is required')
      }

      const jwt = await generateJWT({
        clientToken: CLIENT_TOKEN,
        publicKeyId: value.publicKeyId,
        privateKeyPem: privateKey
      })

      setData(prev => ({
        ...prev,
        jwt,
        publicKeyId: value.publicKeyId,
      }))
    },
  })

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Step 3: Generate JWT</h3>
        <form.Subscribe
          selector={(formState) => [formState.canSubmit, formState.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              form="jwt-form"
              disabled={!canSubmit || !privateKey}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isSubmitting ? 'Generating...' : 'Generate JWT (RS384)'}
            </button>
          )}
        </form.Subscribe>
      </div>
      <div className="p-6">
        <form
          id="jwt-form"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="publicKeyId"
            validators={{
              onChange: ({ value }) =>
                !value || value.trim().length === 0 ? 'Public Key ID is required' : undefined,
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                  Public Key ID
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-red-600 text-sm mt-1">{error}</p>
                ))}
              </div>
            )}
          </form.Field>

        </form>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">JWT Token</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600"
            rows={5}
            value={jwt}
            readOnly
          />
        </div>
      </div>
    </div>
  )
}