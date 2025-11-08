import { useForm } from '@tanstack/react-form'
import * as z from 'zod'

const accessTokenFormSchema = z.object({
  jwt: z.string().min(1, 'JWT token is required'),
})

interface AccessTokenStepProps {
  jwt: string
  accessToken: string
  loading: boolean
  onFetchAccessToken: () => void
  error: string
}

export function AccessTokenStep({
  jwt,
  accessToken,
  loading,
  onFetchAccessToken,
  error
}: AccessTokenStepProps) {
  const form = useForm({
    defaultValues: {
      jwt: jwt,
    },
    onSubmit: async () => {
      onFetchAccessToken()
    },
  })

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Step 4: Fetch Access Token</h3>
        <button
          type="button"
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          disabled={loading || !jwt || !form.state.isValid}
          onClick={() => form.handleSubmit()}
        >
          {loading ? 'Fetching...' : 'Fetch Access Token'}
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
            name="jwt"
            validators={{
              onBlur: ({ value }) => {
                const result = accessTokenFormSchema.shape.jwt.safeParse(value)
                return result.success ? undefined : result.error.issues[0]?.message
              },
            }}
            children={(field) => (
              <div className="hidden">
                <input
                  type="hidden"
                  name={field.name}
                  value={field.state.value}
                />
              </div>
            )}
          />
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
  )
}