import axios from 'axios'
import { useEffect, useState } from 'react'
import axiosClient from './api/axiosClient'
import type { CourseDTO, PageResponse } from './types'

const requestGatewayConnection = async (): Promise<string> => {
  try {
    const response =
      await axiosClient.get<PageResponse<CourseDTO>>('/courses')

    return `Kết nối Gateway thành công (HTTP ${response.status}). Nhận được ${response.data.totalElements} môn học.`
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return `Kết nối Gateway thành công (HTTP ${error.response.status}). Endpoint /api/courses yêu cầu JWT.`
    }

    return 'Không thể kết nối tới API Gateway tại localhost:8080.'
  }
}

function App() {
  const [message, setMessage] = useState('Đang kết nối tới API Gateway...')

  useEffect(() => {
    let isActive = true

    void requestGatewayConnection().then((resultMessage) => {
      if (isActive) {
        setMessage(resultMessage)
      }
    })

    return () => {
      isActive = false
    }
  }, [])

  return <p>{message}</p>
}

export default App
