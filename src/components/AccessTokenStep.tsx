import { useForm } from '@tanstack/react-form'
import { useDPC } from '@/contexts/DPCContext'
import { fetchAccessToken } from '@/lib/auth.server'

export function AccessTokenStep() {
  const { accessToken, jwt, setData } = useDPC()

  const form = useForm({
    defaultValues: {
      jwt,
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
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Step 3: Fetch Access Token</h3>
        <form.Subscribe
          selector={(formState) => [formState.canSubmit, formState.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              form="access-token-form"
              disabled={!canSubmit || !jwt}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isSubmitting ? 'Fetching...' : 'Fetch Access Token'}
            </button>
          )}
        </form.Subscribe>
      </div>
      <div className="p-6">
        <form
          id="access-token-form"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >

          <form.Subscribe
            selector={(formState) => [formState.errors]}
          >
            {([errors]) => {
              if (!errors) return null
              return Object.values(errors).flat().filter(Boolean).map((error, index) => (
                <div key={`error-${index}`} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {String(error)}
                </div>
              ))
            }}
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