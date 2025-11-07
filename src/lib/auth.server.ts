import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const generateJWTSchema = z.object({
  clientToken: z.string(),
  publicKeyId: z.string(),
  privateKeyPem: z.string(),
})

const fetchAccessTokenSchema = z.object({
  jwt: z.string(),
})

const generatePublicKeySignatureSchema = z.object({
  privateKeyPem: z.string(),
})

export const generateJWT = createServerFn({ method: 'POST' })
  .inputValidator(generateJWTSchema)
  .handler(async ({ data }) => {
    const { clientToken, publicKeyId, privateKeyPem } = data

    try {
      // Import crypto module
      const crypto = await import('crypto')

      // Create JWT header
      const header = {
        alg: 'RS384',
        kid: publicKeyId,
        typ: 'JWT'
      }

      // Create JWT payload
      const payload = {
        iss: clientToken,
        sub: clientToken,
        aud: 'https://sandbox.dpc.cms.gov/api/v1/Token/auth',
        exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
        jti: crypto.randomBytes(16).toString('hex')
      }

      // Base64URL encode header and payload
      const encodedHeader = Buffer.from(JSON.stringify(header))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')

      const encodedPayload = Buffer.from(JSON.stringify(payload))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')

      const message = `${encodedHeader}.${encodedPayload}`

      // Create signature using RS384
      const sign = crypto.createSign('RSA-SHA384')
      sign.update(message)
      const signature = sign.sign(privateKeyPem, 'base64')

      const encodedSignature = signature
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')

      const jwt = `${message}.${encodedSignature}`

      return { success: true, jwt }
    } catch (error) {
      console.error('JWT generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during JWT generation'
      }
    }
  })

export const fetchAccessToken = createServerFn({ method: 'POST' })
  .inputValidator(fetchAccessTokenSchema)
  .handler(async ({ data }) => {
    const { jwt } = data

    try {
      const response = await fetch('https://sandbox.dpc.cms.gov/api/v1/Token/auth', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          scope: 'system/*.*',
          grant_type: 'client_credentials',
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: jwt
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      return {
        success: true,
        accessToken: data.access_token || JSON.stringify(data, null, 2)
      }
    } catch (error) {
      console.error('Access token fetch error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during access token fetch'
      }
    }
  })

export const generatePublicKeySignature = createServerFn({ method: 'POST' })
  .inputValidator(generatePublicKeySignatureSchema)
  .handler(async ({ data }) => {
    const { privateKeyPem } = data

    try {
      // Import crypto module
      const crypto = await import('crypto')

      // Use the snippet content from DPC
      const snippetContent = 'This is the snippet used to verify a key pair in DPC.'

      // Create signature using SHA-256 (as per DPC instructions)
      const sign = crypto.createSign('sha256')
      sign.update(snippetContent)
      const signature = sign.sign(privateKeyPem)

      // Convert to base64 (as per step 4 in DPC instructions)
      const base64Signature = signature.toString('base64')

      // Verify the signature (as per step 3 in DPC instructions)
      const verify = crypto.createVerify('sha256')
      verify.update(snippetContent)

      // Extract public key from private key for verification
      const publicKeyPem = crypto.createPublicKey(privateKeyPem).export({
        type: 'spki',
        format: 'pem'
      }) as string

      const isValid = verify.verify(publicKeyPem, signature)

      return {
        success: true,
        signature: base64Signature,
        snippetContent,
        isValid,
        publicKeyPem
      }

    } catch (error) {
      console.error('Public key signature generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during signature generation'
      }
    }
  })