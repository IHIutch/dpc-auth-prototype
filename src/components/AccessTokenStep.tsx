import { useForm } from '@tanstack/react-form'
import { useDPC } from '@/contexts/DPCContext'
import { fetchAccessToken } from '@/lib/auth.server'

export function AccessTokenStep() {
  const { accessToken, jwt, setData } = useDPC()

  const form = useForm({
    defaultValues: {
      jwt: jwt,
    },
    onSubmit: async () => {
      const result = await fetchAccessToken({
        data: { jwt }
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch access token')
      }

      setData(prev => ({
        ...prev,
        accessToken: result.accessToken || '',
      }))
    },
  })

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Step 4: Fetch Access Token</h3>
      </div>
      <div className="p-6">
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
              onChange: ({ value }) => !value ? 'JWT token is required' : undefined,
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JWT Token (Required for Access Token)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600"
                  rows={4}
                  value={field.state.value}
                  readOnly
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-red-600 text-sm mt-1">{error}</p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(formState) => [formState.canSubmit, formState.isSubmitting, formState.errors]}
          >
            {([canSubmit, isSubmitting, errors]) => (
              <>
                <button
                  type="submit"
                  disabled={!canSubmit || !jwt}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors mb-4"
                >
                  {isSubmitting ? 'Fetching...' : 'Fetch Access Token'}
                </button>
                {errors && Object.values(errors).flat().map((error: string) => (
                  <div key={error} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                ))}
              </>
            )}
          </form.Subscribe>
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