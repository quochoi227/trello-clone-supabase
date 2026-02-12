import { useEffect, useState } from 'react'
import { Input } from '../ui/input'

// Một Trick xử lý css khá hay trong việc làm UI UX khi cần ẩn hiện một cái input: Hiểu đơn giản là thay vì phải tạo biến State để chuyển đổi qua lại giữa thẻ Input và Text thông thường thì chúng ta sẽ CSS lại cho cái thẻ Input trông như text bình thường, chỉ khi click và focus vào nó thì style lại trở về như cái input ban đầu.
interface IProps {
  value: string
  onChangedValue: (newValue: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any // để nhận thêm các props khác truyền vào
}

function ToggleFocusInput({ value, onChangedValue, ...props }: IProps) {
  const [inputValue, setInputValue] = useState(value)

  // Blur là khi chúng ta không còn Focus vào phần tử nữa thì sẽ trigger hành động ở đây.
  const triggerBlur = () => {
    // Support Trim cái dữ liệu State inputValue cho đẹp luôn sau khi blur ra ngoài
    setInputValue(inputValue.trim())

    // Nếu giá trị không có gì thay đổi hoặc Nếu user xóa hết nội dung thì set lại giá trị gốc ban đầu theo value từ props và return luôn không làm gì thêm
    if (!inputValue || inputValue.trim() === value) {
      setInputValue(value)
      return
    }

    // console.log('value: ', value)
    // console.log('inputValue: ', inputValue)
    // Khi giá trị có thay đổi ok thì gọi lên func ở Props cha để xử lý
    onChangedValue(inputValue)
  }

  useEffect(() => {
    setInputValue(value)
  }, [value])

  return (
    <Input
      value={inputValue}
      onChange={(event) => { setInputValue(event.target.value) }}
      onBlur={triggerBlur}
      {...props}
      // Magic here :D
      className='font-bold h-[30px] bg-transparent border-transparent focus:bg-white focus:border-primary px-3 shadow-none'
    />
  )
}

export default ToggleFocusInput