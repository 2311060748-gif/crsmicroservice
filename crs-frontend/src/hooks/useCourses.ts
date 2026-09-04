import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchCourses } from '../api/courseApi'
import type { CourseDTO, PageResponse } from '../types'

interface UseCoursesOptions {
  initialPage?: number
  initialSize?: number
  debounceMs?: number
}

interface UseCoursesReturn {
  /** Current page data */
  data: PageResponse<CourseDTO> | null
  /** Whether a request is in progress */
  loading: boolean
  /** Error message if request failed */
  error: string | null
  /** Current search keyword (controlled) */
  keyword: string
  /** Current page number (0-indexed) */
  page: number
  /** Current page size */
  pageSize: number
  /** Update search keyword (triggers debounced fetch) */
  setKeyword: (value: string) => void
  /** Navigate to a specific page */
  setPage: (page: number) => void
  /** Change page size (resets to page 0) */
  setPageSize: (size: number) => void
  /** Force re-fetch current data */
  refetch: () => void
}

export function useCourses(options: UseCoursesOptions = {}): UseCoursesReturn {
  const {
    initialPage = 0,
    initialSize = 10,
    debounceMs = 350,
  } = options

  const [data, setData] = useState<PageResponse<CourseDTO> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeywordState] = useState('')
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialSize)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const doFetch = useCallback(
    async (kw: string, pg: number, sz: number) => {
      // Cancel previous in-flight request
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)

      try {
        const result = await fetchCourses({
          keyword: kw || undefined,
          page: pg,
          size: sz,
        })

        if (!controller.signal.aborted) {
          setData(result)
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return
        const message =
          err instanceof Error ? err.message : 'Không thể tải danh sách môn học.'
        setError(message)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    },
    []
  )

  // Fetch on page / pageSize change (immediate)
  useEffect(() => {
    void doFetch(keyword, page, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  // Debounced fetch on keyword change
  const setKeyword = useCallback(
    (value: string) => {
      setKeywordState(value)
      setPage(0)

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }

      debounceTimer.current = setTimeout(() => {
        void doFetch(value, 0, pageSize)
      }, debounceMs)
    },
    [debounceMs, doFetch, pageSize]
  )

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size)
      setPage(0)
    },
    []
  )

  const refetch = useCallback(() => {
    void doFetch(keyword, page, pageSize)
  }, [doFetch, keyword, page, pageSize])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      abortRef.current?.abort()
    }
  }, [])

  return {
    data,
    loading,
    error,
    keyword,
    page,
    pageSize,
    setKeyword,
    setPage,
    setPageSize,
    refetch,
  }
}
