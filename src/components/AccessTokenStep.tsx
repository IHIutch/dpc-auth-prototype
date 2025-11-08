import { useForm } from '@tanstack/react-form'
import { useAccessToken } from '@/hooks/useAccessToken'
import { useJWTGeneration } from '@/hooks/useJWTGeneration'

export function AccessTokenStep() {
  const { accessToken, fetchAccessToken, isLoading, error } = useAccessToken()
  const { jwt } = useJWTGeneration()

  const form = useForm({
    defaultValues: {
      jwt: jwt,
    },
    onSubmit: async () => {
      fetchAccessToken()
    },
  })

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Step 4: Fetch Access Token</h3>
        <button
          type="button"
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          disabled={isLoading || !jwt || !form.state.isValid}
          onClick={() => form.handleSubmit()}
        >
          {isLoading ? 'Fetching...' : 'Fetch Access Token'}
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
            children={(field) => (
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
              </div>
            )}
          />
        </form>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Access Token Response</label>
          <output
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm cursor-not-allowed bg-gray-400/20 text-gray-600"
          // rows={6}
          // value={accessToken}
          // readOnly
          >
            {accessToken}
          </output>
        </div>
      </div>
    </div>
  )
}