import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

const jwtFormSchema = z.object({
  publicKeyId: z.string().min(1, 'Public Key ID is required'),
})

interface JWTGenerationStepProps {
  publicKeyId: string
  jwt: string
  loading: boolean
  onGenerateJWT: (data: { publicKeyId: string }) => void
  setPublicKeyId: (id: string) => void
  error: string
}

export function JWTGenerationStep({
  publicKeyId,
  jwt,
  loading,
  onGenerateJWT,
  setPublicKeyId,
  error
}: JWTGenerationStepProps) {
  const form = useForm({
    defaultValues: {
      publicKeyId: publicKeyId,
    },
    onSubmit: async ({ value }) => {
      onGenerateJWT(value)
    },
  })

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Step 3: Generate JWT</h3>
        <button
          type="button"
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          disabled={loading || !form.state.isValid}
          onClick={() => form.handleSubmit()}
        >
          {loading ? 'Generating...' : 'Generate JWT (RS384)'}
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
          <div className="mb-4">
            <form.Field
              name="publicKeyId"
              validators={{
                onBlur: ({ value }) => {
                  const result = jwtFormSchema.shape.publicKeyId.safeParse(value)
                  return result.success ? undefined : result.error.issues[0]?.message
                },
              }}
              children={(field) => (
                <>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                    Public Key ID
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value)
                      setPublicKeyId(e.target.value)
                    }}
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length ? (
                    <div className="text-red-600 text-sm mt-1">
                      {field.state.meta.errors.join(', ')}
                    </div>
                  ) : null}
                </>
              )}
            />
          </div>
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