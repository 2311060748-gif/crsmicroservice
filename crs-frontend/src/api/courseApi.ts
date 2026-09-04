import axios from 'axios'
import axiosClient from './axiosClient'
import type { ApiErrorResponse, CourseDTO, CourseRequest, PageResponse } from '../types'

export interface FetchCoursesParams {
  keyword?: string
  page?: number
  size?: number
}

export const fetchCourses = async (
  params: FetchCoursesParams = {}
): Promise<PageResponse<CourseDTO>> => {
  const { keyword, page = 0, size = 10 } = params

  const response = await axiosClient.get<PageResponse<CourseDTO>>('/courses', {
    params: {
      ...(keyword ? { keyword } : {}),
      page,
      size,
    },
  })

  return response.data
}

export const createCourse = async (data: CourseRequest): Promise<CourseDTO> => {
  const response = await axiosClient.post<CourseDTO>('/courses', data)
  return response.data
}

export const updateCourse = async (
  id: number,
  data: CourseRequest
): Promise<CourseDTO> => {
  const response = await axiosClient.put<CourseDTO>(`/courses/${id}`, data)
  return response.data
}

export const deleteCourse = async (id: number): Promise<void> => {
  await axiosClient.delete(`/courses/${id}`)
}

/**
 * Extract a user-friendly error message from an Axios error.
 */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data as ApiErrorResponse
    // Field validation errors
    if (data.fieldErrors) {
      return Object.values(data.fieldErrors).join('. ')
    }
    if (data.message) return data.message
    if (error.response.status === 409) return 'Xung đột: môn học vẫn còn người đăng ký.'
    if (error.response.status === 404) return 'Không tìm thấy môn học.'
    return `Lỗi server (HTTP ${error.response.status}).`
  }
  if (error instanceof Error) return error.message
  return 'Đã xảy ra lỗi không xác định.'
}
