# CardDetail Component

Component hiển thị chi tiết card trong Trello Clone với đầy đủ tính năng và hỗ trợ Markdown.

## Tính năng

### 1. **Giao diện Dialog**
- Layout responsive với 2 panel (left: chi tiết card, right: comments & activity)
- Max width 4xl, max height 90vh với scroll
- Overlay tối khi mở

### 2. **Card Header**
- Checkbox để đánh dấu hoàn thành
- Tiêu đề card lớn, dễ đọc
- Visual hierarchy rõ ràng

### 3. **Action Buttons**
- **Add**: Thêm các thành phần mới
- **Dates**: Quản lý ngày tháng
- **Checklist**: Thêm checklist
- **Members**: Quản lý thành viên
- **Attachment**: Đính kèm file

### 4. **Labels**
- Hiển thị màu sắc labels
- Nút thêm label mới (+)
- Responsive và dễ nhìn

### 5. **Description - Markdown Editor**
- **View mode**: Hiển thị markdown được render đẹp mắt
- **Edit mode**: Textarea để chỉnh sửa với Markdown syntax
- Click vào description để edit
- Save/Cancel buttons
- Hỗ trợ GitHub Flavored Markdown (GFM):
  - Headers: `# H1`, `## H2`, `### H3`
  - Bold: `**text**`
  - Italic: `*text*`
  - Lists: `- item` hoặc `1. item`
  - Links: `[text](url)`
  - Code: `` `code` `` hoặc ` ```code block``` `
  - Horizontal rule: `---`
  - Tables, strikethrough, task lists, etc.

### 6. **Comments Section**
- Input field để viết comment mới
- Markdown support cho comments
- Click vào input để mở editor mode
- Save/Cancel buttons
- Hint về Markdown support

### 7. **Activity Feed**
- Hiển thị lịch sử hoạt động
- Avatar với màu sắc và initials
- Thông tin user và action
- Timestamp có thể click
- Scroll nếu có nhiều activities
- Max height 500px với overflow scroll

## Cách sử dụng

### Method 1: Controlled Component

```tsx
import { useState } from 'react'
import CardDetail from './card-detail'
import { Button } from '@/components/ui/button'

export default function MyBoard() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Card
      </Button>
      
      <CardDetail open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
```

### Method 2: Using DialogTrigger (Built-in)

```tsx
import CardDetail from './card-detail'

export default function MyBoard() {
  return (
    <CardDetail />
    // Component đã có DialogTrigger built-in
  )
}
```

## Props

```typescript
interface CardDetailProps {
  open?: boolean              // Controlled open state
  onOpenChange?: (open: boolean) => void  // Callback khi state thay đổi
}
```

## Mock Data Structure

```typescript
interface Label {
  id: string
  color: string  // Hex color code
  name?: string
}

interface Activity {
  id: string
  user: {
    name: string
    initials: string  // 2 chữ cái
    avatar: string
    color: string     // Hex color for avatar background
  }
  action: string      // Mô tả action
  timestamp: string   // Formatted date string
}

interface CardData {
  id: string
  title: string
  description: string  // Markdown content
  labels: Label[]
  activities: Activity[]
}
```

## Dependencies

Component sử dụng các dependencies sau:

```json
{
  "react-markdown": "^9.x",
  "remark-gfm": "^4.x",
  "@radix-ui/react-dialog": "^1.x",
  "lucide-react": "^0.x"
}
```

## Shadcn Components

Component sử dụng các Shadcn UI components:

- `Dialog` (DialogTrigger, DialogContent)
- `Button`
- `Textarea`
- `Input`
- `Badge`
- `Avatar` (AvatarFallback)
- `Separator`

## Customization

### Thay đổi màu labels

```tsx
const labels = [
  { id: "1", color: "#4ade80", name: "active" },
  { id: "2", color: "#f97316", name: "urgent" },
  { id: "3", color: "#3b82f6", name: "info" }
]
```

### Thay đổi màu avatar

```tsx
const user = {
  name: "Phan Quốc Bình",
  initials: "PB",
  color: "#f97316"  // Orange
}
```

### Custom Markdown styling

Component sử dụng Tailwind's `prose` class. Có thể customize trong `tailwind.config.ts`:

```js
module.exports = {
  theme: {
    extend: {
      typography: {
        // Custom prose styles
      }
    }
  }
}
```

## Tips

1. **Markdown trong Description**: Khuyến khích dùng Markdown để format text đẹp hơn
2. **Activity Feed**: Tự động scroll khi có nhiều activities
3. **Responsive**: Component tự động adapt từ mobile đến desktop
4. **Accessibility**: Sử dụng semantic HTML và ARIA labels

## Future Enhancements

Có thể thêm các tính năng:

- [ ] Auto-save description
- [ ] Real-time collaboration
- [ ] Emoji picker
- [ ] File upload for attachments
- [ ] @mentions trong comments
- [ ] Rich text editor (WYSIWYG)
- [ ] Drag & drop reorder activities
- [ ] Filter activities by type
- [ ] Export card to PDF/Markdown

## Screenshots

Component được thiết kế theo Trello UI với các cải tiến:
- Clean, modern design
- Dark mode support (qua Shadcn theming)
- Smooth animations
- Responsive layout
