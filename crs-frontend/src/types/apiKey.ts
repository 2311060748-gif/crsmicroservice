export type ApiKeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED'

export interface ApiKey {
  id: number
  name: string
  keyPrefix: string
  scopes: string[]
  status: ApiKeyStatus
  createdAt: string
  expiresAt: string | null
  revokedAt: string | null
  createdBy: string
}

export interface CreatedApiKeyResponse {
  id: number
  name: string
  rawKey: string
  keyPrefix: string
  scopes: string[]
  status: ApiKeyStatus
  createdAt: string
  expiresAt: string | null
  createdBy: string
}

export interface CreateApiKeyRequest {
  name: string
  scopes: string[]
  expirationDays?: number | null
}

export interface VerifyApiKeyRequest {
  apiKey: string
  requiredScope?: string
}

export interface VerifyApiKeyResponse {
  valid: boolean
  message: string
  keyName?: string
  scopes?: string[]
  hasRequiredScope: boolean
}
