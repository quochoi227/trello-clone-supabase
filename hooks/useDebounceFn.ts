import { useMemo } from 'react'
import { debounce } from 'lodash'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDebounceFn = (fnToDebounce: (event: any) => void, delay: number = 500) => {
  // Trả lỗi luôn nếu delay nhận vào không phải number
  if (isNaN(delay)) {
    throw new Error('Delay value should be a number.')
  }
  // Tương tự cũng trả lỗi luôn nếu fnToDebounce không phải là 1 function
  if (!fnToDebounce || (typeof fnToDebounce !== 'function')) {
    throw new Error('Debounce must have a function')
  }

  // Bọc debounce trong useMemo để chỉ tạo lại khi fnToDebounce hoặc delay thay đổi
  return useMemo(() => debounce(fnToDebounce, delay), [fnToDebounce, delay])
}
