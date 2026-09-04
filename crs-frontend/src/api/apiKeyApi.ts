import axios from 'axios'
import axiosClient from './axiosClient'
import type {
  ApiKey,
  CreateApiKeyRequest,
  CreatedApiKeyResponse,
  VerifyApiKeyRequest,
  VerifyApiKeyResponse,
} from '../types'

export const fetchApiKeys = async (): Promise<ApiKey[]> => {
  const response = await axiosClient.get<ApiKey[]>('/admin/api-keys')
  return response.data
}

export const createApiKey = async (
  data: CreateApiKeyRequest
): Promise<CreatedApiKeyResponse> => {
  const response = await axiosClient.post<CreatedApiKeyResponse>(
    '/admin/api-keys',
    data
  )
  return response.data
}

export const revokeApiKey = async (id: number): Promise<ApiKey> => {
  const response = await axiosClient.delete<ApiKey>(`/admin/api-keys/${id}`)
  return response.data
}

export const verifyApiKey = async (
  data: VerifyApiKeyRequest
): Promise<VerifyApiKeyResponse> => {
  const response = await axiosClient.post<VerifyApiKeyResponse>(
    '/admin/api-keys/verify',
    data
  )
  return response.data
}

export const extractApiKeyErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      if ('message' in data && typeof data.message === 'string') {
        return data.message
      }
      if ('error' in data && typeof data.error === 'string') {
        return data.error
      }
    }
    return error.message || 'Lỗi xử lý API Key.'
  }
  return 'Lỗi không xác định.'
}
