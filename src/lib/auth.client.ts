import { SNIPPET } from './constants'

// Base64URL encoding utilities
function base64urlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer)
  const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
  return base64urlEncode(binaryString)
}

// Generate random bytes using Web Crypto API
function generateRandomBytes(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function generateJWT({
  clientToken,
  publicKeyId,
  privateKeyPem
}: {
  clientToken: string,
  publicKeyId: string,
  privateKeyPem: string
}) {
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
    jti: generateRandomBytes(16)
  }

  // Base64URL encode header and payload
  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(payload))
  const message = `${encodedHeader}.${encodedPayload}`

  // Import private key
  const privateKeyBuffer = Uint8Array.from(
    atob(privateKeyPem.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '')),
    c => c.charCodeAt(0)
  )

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-384'
    },
    false,
    ['sign']
  )

  // Sign the message
  const encoder = new TextEncoder()
  const messageBytes = encoder.encode(message)
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    messageBytes
  )

  // Convert signature to base64url
  const encodedSignature = arrayBufferToBase64url(signature)

  return `${message}.${encodedSignature}`
}

export async function generatePublicKeySignature({
  privateKeyPem
}: {
  privateKeyPem: string
}) {
  // Import private key
  const privateKeyBuffer = Uint8Array.from(
    atob(privateKeyPem.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '')),
    c => c.charCodeAt(0)
  )

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  )

  // Sign the snippet content
  const encoder = new TextEncoder()
  const snippetBytes = encoder.encode(SNIPPET)
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    snippetBytes
  )

  // Convert to base64
  const uint8Array = new Uint8Array(signature)
  const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
  return btoa(binaryString)
}