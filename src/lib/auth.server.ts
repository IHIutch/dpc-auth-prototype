import { createServerFn } from '@tanstack/react-start'
import * as z from 'zod'

const fetchAccessTokenSchema = z.object({
  jwt: z.string(),
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

