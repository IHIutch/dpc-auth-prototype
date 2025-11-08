
interface ClientTokenStepProps {
  clientToken: string
}

export function ClientTokenStep({ clientToken }: ClientTokenStepProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Step 1: Client Configuration</h3>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <label htmlFor="clientToken" className="block text-sm font-medium text-gray-700 mb-2">
            Client Token
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed bg-gray-400/20 text-gray-600"
            id="clientToken"
            value={clientToken}
            rows={8}
            readOnly
          />
        </div>
      </div>
    </div>
  )
}