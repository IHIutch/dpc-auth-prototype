import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { KeyGenerationStep } from '@/components/KeyGenerationStep'
import { JWTGenerationStep } from '@/components/JWTGenerationStep'
import { AccessTokenStep } from '@/components/AccessTokenStep'
import { useDPC } from '@/contexts/DPCContext'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { privateKey, clientToken, publicKeyId } = useDPC()

  // Show warning if user tries to close window with generated private key
  React.useEffect(() => {
    if (!privateKey && !clientToken && !publicKeyId) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [privateKey, clientToken, publicKeyId])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">DPC Authorization Prototype</h1>

      <KeyGenerationStep />
      <JWTGenerationStep />
      <AccessTokenStep />
    </div>
  )
}

