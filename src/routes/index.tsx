import { createFileRoute } from '@tanstack/react-router'
import { ClientTokenStep } from '@/components/ClientTokenStep'
import { KeyGenerationStep } from '@/components/KeyGenerationStep'
import { JWTGenerationStep } from '@/components/JWTGenerationStep'
import { AccessTokenStep } from '@/components/AccessTokenStep'
import { useKeyGeneration } from '@/hooks/useKeyGeneration'
import { useJWTGeneration } from '@/hooks/useJWTGeneration'
import { useAccessToken } from '@/hooks/useAccessToken'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const keyGeneration = useKeyGeneration()
  const jwtGeneration = useJWTGeneration()
  const accessToken = useAccessToken()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">DPC Authorization Prototype</h1>

      <ClientTokenStep />

      <KeyGenerationStep
        publicKey={keyGeneration.publicKey}
        privateKey={keyGeneration.privateKey}
        publicKeySignature={keyGeneration.publicKeySignature}
        loading={keyGeneration.isLoading}
        onGenerateKeyPair={keyGeneration.generateKeyPair}
        error={keyGeneration.error}
      />

      <JWTGenerationStep
        publicKeyId={jwtGeneration.publicKeyId}
        jwt={jwtGeneration.jwt}
        loading={jwtGeneration.isLoading}
        onGenerateJWT={jwtGeneration.generateJWT}
        setPublicKeyId={jwtGeneration.setPublicKeyId}
        error={jwtGeneration.error}
      />

      <AccessTokenStep
        jwt={jwtGeneration.jwt}
        accessToken={accessToken.accessToken}
        loading={accessToken.isLoading}
        onFetchAccessToken={accessToken.fetchAccessToken}
        error={accessToken.error}
      />
    </div>
  )
}

