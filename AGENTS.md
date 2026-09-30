# AGENTS.md — Hướng dẫn và Tài liệu Kiến trúc Dự án Trello Clone (Supabase)

Tài liệu này cung cấp thông tin toàn diện và quy chuẩn phát triển dành cho các AI Agent (và Developer) khi đọc hiểu, bảo trì, hoặc mở rộng codebase **Trello Clone Supabase**.

---

## 1. Tổng quan Dự án (Project Overview)

- **Tên dự án:** Trello Clone Supabase
- **Mục tiêu:** Xây dựng ứng dụng quản lý công việc theo mô hình Kanban Board tương tự Trello, hỗ trợ kéo thả trực quan, cập nhật thời gian thực (Real-time), cộng tác nhiều người dùng, phân quyền qua Supabase Auth và lưu trữ đám mây.
- **Tính năng cốt lõi đã hoàn thiện:**
  - 📋 **Quản lý Board & Column & Card:** Tạo, chỉnh sửa tên, sắp xếp thứ tự và xóa Board/Column/Card.
  - 🔄 **Kéo thả mượt mà (@dnd-kit):** Kéo thả Card trong cùng Column, giữa các Column khác nhau, và kéo thả sắp xếp các Column.
  - ⚡ **Real-time Sync (Supabase Realtime):** Tự động đồng bộ trạng thái khi có nhiều người dùng thao tác cùng lúc (kèm cơ chế lọc bỏ event của chính mình để tránh giật lag).
  - 📝 **Card Detail & Markdown Editor:** Xem chi tiết card với modal 2 cột, hỗ trợ soạn thảo Markdown (GitHub Flavored Markdown) cho mô tả và bình luận, hỗ trợ Dark Mode via Tailwind Typography `prose`.
  - 🖼️ **Upload Card Cover:** Upload ảnh bìa card lên Supabase Storage bucket (`card-covers`) và cập nhật URL trực tiếp.
  - 💬 **Activity Feed & Comments:** Ghi lại nhật ký di chuyển card, thêm/sửa bình luận, hiển thị avatar người dùng.
  - 👥 **Mời thành viên (Board Invitations):** Gửi lời mời qua email, chấp nhận/từ chối lời mời với thông báo chuông (Bell) và Realtime notification.
  - 🔍 **Tìm kiếm Board:** Tìm kiếm Board tức thì với debounced input và bàn phím điều hướng (ArrowUp, ArrowDown, Enter).
  - 🎨 **Theme & Styling:** Hỗ trợ Light/Dark mode (`next-themes`), Shadcn UI components.

---

## 2. Công nghệ & Thư viện (Tech Stack)

| Hạng mục | Công nghệ / Thư viện | Vai trò |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15+ (App Router)** | Fullstack framework, Server Components, Server Actions, Route Handlers |
| **Language** | **TypeScript 5+** | Type-safe trên toàn bộ client và server |
| **Backend & BaaS** | **Supabase** | PostgreSQL Database, Row-Level Security (RLS), Auth, Realtime, Storage |
| **Supabase SDKs** | `@supabase/ssr`, `@supabase/supabase-js` | SSR Cookie auth & Admin client với Service Role Key |
| **State Management** | **Zustand 5** | Quản lý global state cho Board, Card và Realtime subscriptions |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | Xử lý kéo thả Kanban mượt mà với custom sensors |
| **UI Components** | **Shadcn UI (Radix UI)** | Dialog, DropdownMenu, Popover, Alert, Button, Input, Textarea, Avatar... |
| **Styling** | **Tailwind CSS 3.4**, `@tailwindcss/typography` | Styling utility-first, typography plugin cho định dạng Markdown |
| **Markdown** | `react-markdown`, `remark-gfm` | Render markdown hỗ trợ tiêu đề, danh sách, checklist, code block, table |
| **Notifications** | `sonner` | Toast notifications |
| **Icons** | `lucide-react` | Bộ icon chuẩn |
| **Utilities** | `lodash` (`cloneDeep`, `isEmpty`), `clsx`, `tailwind-merge` | Xử lý dữ liệu và class name |

---

## 3. Cấu trúc Thư mục (Directory Structure)

```text
trello-clone-supabase/
├── actions/                         # Next.js Server Actions ("use server")
│   ├── activity-actions.ts          # Thao tác với Activities & Comments, lấy user info
│   ├── auth-actions.ts              # Xử lý đăng ký, lấy user hiện tại
│   ├── board-actions.ts             # Thao tác CRUD Board, fetch danh sách board của user
│   ├── board-invitation-actions.ts  # Gửi, lấy danh sách, chấp nhận/từ chối lời mời
│   ├── card-actions.ts              # Tạo, update, xóa card, chuyển card giữa các column
│   └── column-action.ts             # Tạo, sửa, xóa, lấy chi tiết column
│
├── app/                             # Next.js App Router
│   ├── api/                         # REST Route Handlers
│   │   ├── activities/              # GET (by cardId), POST (thêm activity)
│   │   │   └── [id]/route.ts        # GET chi tiết activity
│   │   ├── boards/                  # GET (search), POST (tạo board)
│   │   │   ├── [id]/route.ts        # GET, PATCH, DELETE board
│   │   │   └── supports/moving_card/route.ts # PUT: API chuyên biệt cho di chuyển card
│   │   ├── cards/                   # POST tạo card
│   │   │   └── [id]/                # GET, PATCH, DELETE card
│   │   │       └── cover/route.ts   # POST upload cover image lên Supabase Storage
│   │   ├── columns/                 # POST tạo column
│   │   │   └── [id]/route.ts        # GET, PATCH, DELETE column
│   │   ├── invitations/             # GET, POST lời mời
│   │   │   └── [id]/
│   │   │       ├── accept/route.ts  # PUT chấp nhận lời mời
│   │   │       └── decline/route.ts # PUT từ chối lời mời
│   │   └── users/route.ts           # GET user hiện tại
│   ├── auth/                        # Luồng xác thực (Login, Sign-up, Confirm, Callback...)
│   ├── boards/
│   │   ├── (main)/                  # Trang danh sách boards (Recently viewed, Shared...)
│   │   └── [id]/                    # Trang chi tiết 1 Board (Không gian làm việc Kanban)
│   │       └── _components/
│   │           ├── board/           # BoardBar, BoardBarTitle, BoardInvitation, BoardOptions
│   │           └── card/            # CardDetail (Modal), CardActivities, CardDescription...
│   ├── layout.tsx                   # Root layout bọc ThemeProvider
│   ├── page.tsx                     # Redirect mặc định sang /boards
│   └── proxy.ts                     # Middleware cập nhật session auth cookie
│
├── components/                      # UI Components tái sử dụng
│   ├── boards/                      # BoardCard, CreateBoardMenu
│   ├── invitations/                 # Notification dropdown & Invitation items
│   ├── kanban/                      # KanbanBoard, KanbanColumn, KanbanCard, ListColumns
│   │   └── toggle-focus-input.tsx   # Input đổi style inline tiện lợi
│   ├── layout/                      # Header, Sidebar
│   └── ui/                          # Toàn bộ Shadcn primitives (Dialog, Button, Input...)
│
├── docs/                            # Tài liệu kỹ thuật chi tiết
│   ├── CARD_DETAIL_COMPONENT.md     # Tài liệu thiết kế & API Card Detail
│   ├── MARKDOWN_STYLING_FIX.md      # Khắc phục Tailwind Preflight reset Markdown
│   ├── MARKDOWN_FIX_SUMMARY.md      # Tóm tắt fix @tailwindcss/typography
│   └── SUPABASE_QUERY_PATTERNS.md   # Best practices & Query patterns với Supabase
│
├── hooks/
│   └── useDebounceFn.ts             # Hook debounce function execution
│
├── lib/
│   ├── custom-lib/
│   │   └── DndKitSensors.ts         # MouseSensor & TouchSensor chặn dnd khi gặp data-no-dnd
│   ├── queries/
│   │   └── board-queries.ts         # Query boards, columns, cards chuyên dụng
│   ├── supabase/
│   │   ├── admin.ts                 # createAdminClient() dùng SUPABASE_SERVICE_ROLE_KEY
│   │   ├── client.ts                # createClient() dùng cho Client Component (browser)
│   │   ├── proxy.ts                 # Xử lý cập nhật session cookie cho SSR/Middleware
│   │   ├── server.ts                # createClient() dùng cho Server Components & Actions
│   │   └── server-auth.ts           # Helper xác thực user trên Server
│   └── utils.ts                     # Hàm helper cn() kết hợp clsx + tailwind-merge
│
├── stores/                          # Zustand Stores
│   ├── board-store.ts               # State Board, Columns, Cards & Supabase Realtime Channels
│   └── card-store.ts                # State Card đang active & Realtime Activities Channel
│
├── types/                           # TypeScript Interfaces & Types
│   ├── activity.ts                  # Activity, ActivityWithUser
│   ├── board.ts                     # BoardStore interface
│   ├── card.ts                      # CardStore interface
│   ├── column.ts                    # ColumnStore interface
│   ├── comment.ts                   # Comment interface
│   ├── invitation.ts                # BoardInvitation, InvitationWithDetails
│   └── user.ts                      # UserStore interface
│
└── utils/
    ├── formatters.ts                # generatePlaceholderCard, generateScaffoldCard
    └── sorts.ts                     # mapOrder() sắp xếp mảng con theo mảng ID chuẩn
```

---

## 4. Cơ sở Dữ liệu & Data Models (Database Schema)

Dự án sử dụng cơ sở dữ liệu PostgreSQL trên Supabase. Dưới đây là các bảng chính và mối quan hệ:

### 4.1. Bảng `boards`
- `id` (uuid, Primary Key)
- `title` (text): Tên board
- `slug` (text): URL friendly slug
- `description` (text): Mô tả board
- `type` (text): Quyền xem (`"private"` | `"workspace"` | `"public"`)
- `owner_ids` (uuid[]): Mảng ID các chủ sở hữu board
- `member_ids` (uuid[]): Mảng ID các thành viên tham gia board
- `column_order_ids` (text[]): Mảng ID lưu thứ tự hiển thị của các columns
- `user_id` (uuid): ID người tạo hoặc cập nhật gần nhất
- `created_at` (timestamptz)

### 4.2. Bảng `columns`
- `id` (uuid, Primary Key)
- `board_id` (uuid, Foreign Key -> `boards.id` on delete cascade)
- `title` (text): Tiêu đề cột (vd: "To Do", "In Progress", "Done")
- `card_order_ids` (text[]): Mảng ID lưu thứ tự các card trong cột
- `user_id` (uuid): Người sửa đổi
- `created_at` (timestamptz)

### 4.3. Bảng `cards`
- `id` (uuid, Primary Key)
- `board_id` (uuid, Foreign Key -> `boards.id` on delete cascade)
- `column_id` (uuid, Foreign Key -> `columns.id` on delete cascade)
- `title` (text): Tiêu đề card
- `description` (text, nullable): Nội dung markdown mô tả chi tiết
- `cover` (text, nullable): URL ảnh bìa lưu tại Supabase Storage
- `new_index` (int, nullable): Vị trí index mới khi di chuyển
- `owner_id` (uuid): Người sở hữu / cập nhật
- `created_at` (timestamptz)

### 4.4. Bảng `activities`
- `id` (uuid, Primary Key)
- `card_id` (uuid, Foreign Key -> `cards.id` on delete cascade)
- `board_id` (uuid, Foreign Key -> `boards.id`)
- `user_id` (uuid): Người thực hiện hành động
- `action_type` (text): `"comment_added"` | `"comment_edited"` | `"card_moved"` | `"member_added"`
- `data` (jsonb): Dữ liệu chi tiết hành động (vd: `{ content: "..." }` hoặc `{ fromColumn: "To Do", toColumn: "Done" }`)
- `created_at` (timestamptz)

### 4.5. Bảng `board_invitations`
- `id` (uuid, Primary Key)
- `board_id` (uuid, Foreign Key -> `boards.id`)
- `invitee_email` (text): Email người nhận lời mời
- `inviter_id` (uuid): ID người gửi lời mời
- `status` (text): `"pending"` | `"accepted"` | `"declined"`
- `created_at` (timestamptz)

### 4.6. Supabase Storage
- Bucket: `card-covers` (Public hoặc cho phép người dùng authenticated upload)
- Kích thước tối đa file: 5MB
- Định dạng hợp lệ: Ảnh (`image/*`)

---

## 5. Các Cơ chế Kiến trúc Trọng tâm (Core Architectural Mechanisms)

### 5.1. Kéo thả Kanban (@dnd-kit) & Placeholder Cards
- **Cơ chế sắp xếp thứ tự:**
  - Thứ tự Column trong Board được quyết định bởi mảng `board.column_order_ids`.
  - Thứ tự Card trong Column được quyết định bởi mảng `column.card_order_ids`.
  - Hàm `mapOrder(items, orderArray, 'id')` trong [`utils/sorts.ts`](file:///e:/Workspace/trello-clone-supabase/utils/sorts.ts) được dùng để sắp xếp danh sách hiển thị theo đúng mảng ID này.
- **Xử lý Cột rỗng (Empty Column):**
  - Khi một cột không có card nào, dnd-kit sẽ gặp lỗi va chạm và không thể kéo card khác vào cột đó.
  - Dự án giải quyết bằng hàm `generatePlaceholderCard(column)` tạo ra một card ảo mang cờ `FE_PlaceholderCard: true`. Card này ẩn trên UI (`className="hidden"`).
  - Khi thả card thật vào cột rỗng hoặc khi gửi data về backend, placeholder card sẽ tự động bị loại bỏ.
- **Custom Sensors:**
  - Định nghĩa tại [`lib/custom-lib/DndKitSensors.ts`](file:///e:/Workspace/trello-clone-supabase/lib/custom-lib/DndKitSensors.ts).
  - Tự động bỏ qua kéo thả nếu phần tử hoặc cha của nó có thuộc tính `data-no-dnd`.
  - `MouseSensor` kích hoạt sau khi di chuột 10px; `TouchSensor` kích hoạt sau khi nhấn giữ 250ms (dung sai 50px).
- **Di chuyển Card giữa các Cột:**
  - Khi kéo: `handleDragOver` cập nhật state tạm thời để tạo animation mượt mà.
  - Khi thả: `handleDragEnd` gọi `moveCardToDifferentColumn()`, gửi request đến `/api/boards/supports/moving_card` để cập nhật đồng thời `card_order_ids` ở cả 2 cột và `column_id` của card trong database qua `Promise.all`. Đồng thời tự động ghi nhận activity `card_moved`.

### 5.2. Đồng bộ Thời gian thực (Supabase Realtime)
- Quản lý tập trung trong [`stores/board-store.ts`](file:///e:/Workspace/trello-clone-supabase/stores/board-store.ts) và [`stores/card-store.ts`](file:///e:/Workspace/trello-clone-supabase/stores/card-store.ts).
- Các channel được đăng ký khi mở Board:
  - `board-{boardId}`: Lắng nghe UPDATE bảng `boards` (ví dụ khi có ai đổi thứ tự cột hoặc tên board).
  - `column-{boardId}`: Lắng nghe INSERT, UPDATE, DELETE bảng `columns`.
  - `card-{boardId}`: Lắng nghe INSERT, UPDATE, DELETE bảng `cards`.
  - `card-{cardId}`: Lắng nghe các thay đổi trong bảng `activities` (comment mới, activity mới).
- **Cơ chế chống phản xạ (Self-action prevention):**
  - Trong mỗi listener, kiểm tra `newRecord.owner_id === user?.id` hoặc `newRecord.user_id === user?.id`. Nếu hành động do chính user hiện tại thực hiện thì **bỏ qua**, vì UI đã được cập nhật trước đó (Optimistic update / Local state), giúp tránh flicker và xung đột race condition.

### 5.3. Cập nhật Lạc quan (Optimistic UI Updates)
- Kết hợp React `useOptimistic` và `startTransition` tại [`components/kanban/list-columns.tsx`](file:///e:/Workspace/trello-clone-supabase/components/kanban/list-columns.tsx) và [`components/kanban/kanban-column.tsx`](file:///e:/Workspace/trello-clone-supabase/components/kanban/kanban-column.tsx).
- Khi tạo Column/Card:
  1. Tạo ngay một item tạm với ID dạng `temp-...` và render ngay lập tức vào state.
  2. Gửi API request lên Server.
  3. Khi Server phản hồi thành công, dispatch action `replace` để tráo item `temp-...` bằng item thực tế từ DB.
  4. Nếu thất bại, dispatch action `remove` để hoàn tác và hiện thông báo lỗi qua `sonner`.

### 5.4. Xác thực & Phân quyền (Supabase SSR & Admin Client)
- **Client thông thường:** Sử dụng cookie session thông qua `@supabase/ssr`.
  - Client component: Dùng `createClient()` từ [`lib/supabase/client.ts`](file:///e:/Workspace/trello-clone-supabase/lib/supabase/client.ts).
  - Server Component/Action: Dùng `createClient()` từ [`lib/supabase/server.ts`](file:///e:/Workspace/trello-clone-supabase/lib/supabase/server.ts).
  - Session Middleware: [`proxy.ts`](file:///e:/Workspace/trello-clone-supabase/proxy.ts) và [`lib/supabase/proxy.ts`](file:///e:/Workspace/trello-clone-supabase/lib/supabase/proxy.ts) bảo vệ các route riêng tư, tự động redirect sang `/auth/login` nếu chưa đăng nhập.
- **Admin Client:**
  - Được khởi tạo tại [`lib/supabase/admin.ts`](file:///e:/Workspace/trello-clone-supabase/lib/supabase/admin.ts) bằng `SUPABASE_SERVICE_ROLE_KEY`.
  - **Mục đích:** Bỏ qua RLS để truy xuất thông tin người dùng từ `auth.users` (lấy tên, avatar, email) phục vụ hiển thị Activity feed (`getUserById`).
  - ⚠️ **LƯU Ý:** TUYỆT ĐỐI không gọi `createAdminClient()` từ phía client hoặc để lộ `SUPABASE_SERVICE_ROLE_KEY`.

---

## 6. Biến Môi trường (Environment Variables)

File cấu hình môi trường cục bộ: `.env.local`

```env
# URL của Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co

# Anon / Publishable key (dùng ở cả Client và Server)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...

# Service Role Key (CHỈ dùng ở Server Side để gọi Admin API, không commit lên git)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# URL của website (tùy chọn, dùng để redirect email auth)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 7. Các Lệnh Thường dùng (Commands & Scripts)

```bash
# Cài đặt dependencies
npm install

# Khởi chạy môi trường development (mặc định tại http://localhost:3000)
npm run dev

# Kiểm tra lỗi linting
npm run lint

# Build production
npm run build

# Chạy bản production đã build
npm run start
```

---

## 8. Hướng dẫn & Quy tắc Dành cho AI Agent khi Sửa đổi Code (Agent Guidelines)

Khi thực hiện task trong dự án này, Agent cần tuân thủ nghiêm ngặt các nguyên tắc sau:

### 8.1. Quy tắc về Kéo thả (DnD Kit)
1. **Không làm hỏng `column_order_ids` và `card_order_ids`:** Mọi thao tác thêm/xóa/sửa cột hoặc thẻ đều phải đồng bộ với mảng thứ tự tương ứng trên bảng `boards` hoặc `columns`.
2. **Bảo toàn Placeholder Card:** Cột rỗng bắt buộc phải có `FE_PlaceholderCard: true`. Nếu thay đổi cấu trúc dữ liệu của Column hoặc Card, hãy kiểm tra hàm `generatePlaceholderCard` và các điều kiện lọc placeholder (`!card.FE_PlaceholderCard`).
3. **Thao tác Form và Nút bấm trong Card/Column:** Các phần tử tương tác (input, button, menu) nằm trong khu vực draggable cần có thuộc tính `data-no-dnd="true"` hoặc dùng `ToggleFocusInput` để tránh xung đột sự kiện kéo thả.

### 8.2. Quy tắc về State Management & Realtime
1. **Bảo đảm tính Bất biến (Immutability):** Khi cập nhật Zustand store (`board-store.ts`), luôn clone mảng/đối tượng (dùng `cloneDeep` hoặc spread operator chuẩn cho nested data). Không mutate trực tiếp `column.cards.push()`.
2. **Giữ cơ chế lọc sự kiện của chính mình:** Khi thêm listener realtime mới, bắt buộc phải kiểm tra `userId` hoặc `owner_id` để không apply lại thay đổi do chính tab hiện tại vừa gửi lên.
3. **Quản lý Vòng đời Channel:** Khi subscribe một channel (`subscribeToBoard`, `subscribeToCard`, ...), phải gọi unsubscribe channel cũ trước khi khởi tạo channel mới, và luôn dọn dẹp (cleanup) trong hook `useEffect`.

### 8.3. Quy tắc về Server Action & API Route
1. **Ưu tiên kiến trúc hiện hành:** Dự án hỗ trợ song song Server Actions (`actions/`) và API Routes (`app/api/`). Khi bổ sung tính năng mới, nếu UI cần phản hồi REST thì tạo route trong `app/api/`, hoặc gọi trực tiếp Server Action nếu xử lý form/revalidatePath.
2. **Luôn kiểm tra Auth trên Server:** Mọi Server Action và Route Handler phải lấy session qua `createClient()` và kiểm tra `getUser()`. Trả về `401 Unauthorized` nếu user chưa xác thực.
3. **Bảo mật Service Role Key:** Không bao giờ import `createAdminClient()` vào Client Components (`"use client"`).

### 8.4. Quy tắc về Giao diện & Styling
1. **Shadcn UI:** Sử dụng các component sẵn có trong `@/components/ui/`. Nếu cần component mới của Shadcn, cài đặt qua `npx shadcn@latest add <component>`.
2. **Typography & Markdown:** Mọi nơi render Markdown bằng `react-markdown` phải có wrapper chứa các class Tailwind Typography: `prose prose-sm dark:prose-invert max-w-none` (tham khảo [`docs/MARKDOWN_STYLING_FIX.md`](file:///e:/Workspace/trello-clone-supabase/docs/MARKDOWN_STYLING_FIX.md)).
3. **Dark Mode:** Tất cả component mới phải kiểm tra độ tương phản và tương thích với cả Light theme và Dark theme.
