import axiosClient from './axiosClient'
import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types'
import axios from 'axios'

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>('/auth/login', data)
  return response.data
}

export const registerApi = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await axiosClient.post<RegisterResponse>(
    '/auth/register',
    data
  )
  return response.data
}

export const getCurrentUserApi = async (): Promise<CurrentUserResponse> => {
  const response = await axiosClient.get<CurrentUserResponse>('/auth/me')
  return response.data
}

export const extractAuthErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Tài khoản hoặc mật khẩu không chính xác.'
    }
    if (error.response?.status === 409) {
      return 'Tên đăng nhập hoặc MSSV đã tồn tại trong hệ thống.'
    }
    const data = error.response?.data
    if (data && typeof data === 'object') {
      if ('message' in data && typeof data.message === 'string') {
        return data.message
      }
      if ('error' in data && typeof data.error === 'string') {
        return data.error
      }
    }
    return error.message || 'Có lỗi xảy ra khi kết nối máy chủ.'
  }
  return 'Lỗi không xác định. Vui lòng thử lại.'
}
