import axiosClient from './axiosClient'
import type { CourseDTO, PageResponse } from '../types'

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
