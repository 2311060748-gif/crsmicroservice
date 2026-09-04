import axios from 'axios'
import axiosClient from './axiosClient'
import type { PageResponse, Registration, RegistrationRequestDTO } from '../types'

export const registerCourseApi = async (
  dto: RegistrationRequestDTO
): Promise<Registration> => {
  const response = await axiosClient.post<Registration>('/registrations', dto)
  return response.data
}

export const cancelRegistrationApi = async (
  registrationId: number
): Promise<void> => {
  await axiosClient.delete(`/registrations/${registrationId}`)
}

export const getStudentRegistrationsApi = async (
  studentId: number,
  page = 0,
  size = 100
): Promise<PageResponse<Registration>> => {
  const response = await axiosClient.get<PageResponse<Registration>>(
    `/registrations/student/${studentId}`,
    {
      params: { page, size },
    }
  )
  return response.data
}

export const getAllRegistrationsApi = async (
  page = 0,
  size = 20
): Promise<PageResponse<Registration>> => {
  const response = await axiosClient.get<PageResponse<Registration>>(
    '/registrations',
    {
      params: { page, size },
    }
  )
  return response.data
}

export const extractRegistrationErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 409) {
      const data = error.response.data
      if (data && typeof data === 'object') {
        if ('message' in data && typeof data.message === 'string') {
          return data.message
        }
        if ('error' in data && typeof data.error === 'string') {
          return data.error
        }
      }
      return 'Môn học đã hết chỗ hoặc bạn đã đăng ký môn học này.'
    }
    if (error.response?.status === 404) {
      return 'Môn học hoặc đăng ký không tồn tại.'
    }
    if (error.response?.status === 503) {
      return 'Dịch vụ Course-Service hiện không phản hồi. Vui lòng thử lại sau.'
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
    return error.message || 'Lỗi xử lý đăng ký môn học.'
  }
  return 'Lỗi không xác định khi đăng ký môn học.'
}
