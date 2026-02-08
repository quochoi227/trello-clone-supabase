# Khắc phục Tailwind CSS Reset Markdown Styles

## Vấn đề

Khi sử dụng ReactMarkdown hoặc bất kỳ markdown renderer nào với Tailwind CSS, các HTML elements được render từ markdown (như `h1`, `h2`, `p`, `ul`, `ol`, etc.) bị mất hết style do Tailwind's CSS reset (Preflight).

## Giải pháp

### 1. Cài đặt Tailwind Typography Plugin

```bash
npm install -D @tailwindcss/typography
```

### 2. Thêm Plugin vào Tailwind Config

File: `tailwind.config.ts`

```typescript
export default {
  // ... other config
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),  // ✅ Thêm dòng này
  ],
} satisfies Config;
```

### 3. Áp dụng Prose Classes cho Markdown Content

```tsx
<div className="prose prose-sm dark:prose-invert max-w-none">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {markdownContent}
  </ReactMarkdown>
</div>
```

### 4. (Optional) Custom Styles

Nếu cần customize thêm, thêm vào `globals.css`:

```css
@layer components {
  .markdown-content h1 {
    @apply text-2xl font-bold mt-6 mb-4;
  }
  
  .markdown-content h2 {
    @apply text-xl font-semibold mt-5 mb-3;
  }
  
  /* ... more custom styles */
}
```

## Prose Classes Available

### Size Variants
- `prose-sm` - Small size
- `prose` - Default size  
- `prose-lg` - Large size
- `prose-xl` - Extra large size
- `prose-2xl` - 2X large size

### Dark Mode
- `dark:prose-invert` - Inverts colors for dark mode

### Element Modifiers
```tsx
className="
  prose
  prose-headings:font-bold
  prose-headings:text-foreground
  prose-p:text-muted-foreground
  prose-a:text-blue-600
  prose-a:no-underline
  prose-code:text-pink-600
  prose-pre:bg-slate-900
  prose-hr:border-border
"
```

### Width Control
- `max-w-none` - No max width limit (recommended for full-width containers)
- `max-w-prose` - Default prose max width

## Ví dụ Hoàn chỉnh

### Component với Markdown Support

```tsx
"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownViewer({ content }: { content: string }) {
  return (
    <div 
      className="
        prose 
        prose-sm 
        dark:prose-invert 
        max-w-none
        prose-headings:mt-4 
        prose-headings:mb-2
        prose-p:my-2
        prose-a:text-blue-600
        prose-code:bg-muted
        prose-code:px-1.5
        prose-code:py-0.5
        prose-code:rounded
        prose-pre:bg-muted
        prose-hr:my-4
      "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

### Với Edit Mode

```tsx
"use client"

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function MarkdownEditor() {
  const [content, setContent] = useState('# Hello World')
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div>
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] font-mono"
          />
          <Button onClick={() => setIsEditing(false)}>
            Save
          </Button>
        </div>
      ) : (
        <div 
          className="prose prose-sm dark:prose-invert max-w-none cursor-pointer hover:bg-muted/50 p-4 rounded"
          onClick={() => setIsEditing(true)}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
```

## Markdown Features Supported (với remark-gfm)

### Basic Formatting
- **Bold**: `**text**` or `__text__`
- *Italic*: `*text*` or `_text_`
- ~~Strikethrough~~: `~~text~~`
- `Inline code`: `` `code` ``

### Headers
```markdown
# H1
## H2
### H3
#### H4
##### H5
###### H6
```

### Lists
```markdown
- Unordered list
- Another item
  - Nested item

1. Ordered list
2. Second item
```

### Links & Images
```markdown
[Link text](https://example.com)
![Alt text](image-url.jpg)
```

### Code Blocks
````markdown
```javascript
const hello = "world";
console.log(hello);
```
````

### Tables (GFM)
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### Task Lists (GFM)
```markdown
- [x] Completed task
- [ ] Incomplete task
```

### Blockquotes
```markdown
> This is a quote
> Multiple lines
```

### Horizontal Rules
```markdown
---
or
***
or
___
```

## Customization Tips

### 1. Adjust Colors cho Dark Mode

```tsx
className="
  prose 
  dark:prose-invert
  prose-headings:text-foreground
  prose-p:text-foreground/80
  prose-a:text-primary
  prose-code:text-foreground
  prose-code:bg-muted
"
```

### 2. Spacing Control

```tsx
className="
  prose
  prose-headings:mt-8
  prose-headings:mb-4
  prose-p:my-4
  prose-ul:my-4
  prose-ol:my-4
  prose-li:my-1
"
```

### 3. Font Size

```tsx
// Small
className="prose prose-sm"

// Large  
className="prose prose-lg"

// Custom
className="prose prose-base md:prose-lg lg:prose-xl"
```

## Troubleshooting

### Issue: Styles không apply

**Solution:** 
- Đảm bảo đã cài `@tailwindcss/typography`
- Kiểm tra plugin đã được thêm vào `tailwind.config.ts`
- Restart dev server: `npm run dev`

### Issue: Dark mode không hoạt động

**Solution:**
- Thêm `dark:prose-invert` class
- Đảm bảo dark mode được setup trong app (next-themes)

### Issue: Max width quá nhỏ

**Solution:**
- Thêm `max-w-none` để remove max width limit
- Hoặc dùng `max-w-full`, `max-w-4xl`, etc.

### Issue: Line height quá cao/thấp

**Solution:**
```tsx
className="prose prose-sm leading-relaxed"
// or
className="prose prose-sm leading-tight"
```

## Resources

- [Tailwind Typography Docs](https://tailwindcss.com/docs/typography-plugin)
- [Prose Class Reference](https://github.com/tailwindlabs/tailwindcss-typography)
- [React Markdown](https://remarkjs.github.io/react-markdown/)
- [Remark GFM](https://github.com/remarkjs/remark-gfm)

## Tóm tắt

1. ✅ Cài `@tailwindcss/typography`
2. ✅ Add plugin vào config
3. ✅ Dùng `prose` classes
4. ✅ Add `dark:prose-invert` cho dark mode
5. ✅ Customize với modifiers nếu cần

Vậy là xong! Markdown content giờ sẽ được style đẹp và professional. 🎉
