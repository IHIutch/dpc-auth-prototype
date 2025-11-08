import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ClientTokenStep } from '@/components/ClientTokenStep'
import { KeyGenerationStep } from '@/components/KeyGenerationStep'
import { JWTGenerationStep } from '@/components/JWTGenerationStep'
import { AccessTokenStep } from '@/components/AccessTokenStep'
import { useKeyGeneration } from '@/hooks/useKeyGeneration'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { privateKey } = useKeyGeneration()

  // Show warning if user tries to close window with generated private key
  React.useEffect(() => {
    if (!privateKey) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [privateKey])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">DPC Authorization Prototype</h1>

      <ClientTokenStep />
      <KeyGenerationStep />
      <JWTGenerationStep />
      <AccessTokenStep />
    </div>
  )
}

