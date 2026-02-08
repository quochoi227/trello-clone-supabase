# Supabase Query Patterns - Trello Clone

## 📖 Overview
Các patterns và best practices để query data với Supabase trong dự án.

---

## 🎯 **1. Nested Relationships (JOIN Query)**

### Syntax cơ bản:
```typescript
const { data } = await supabase
  .from("parent_table")
  .select(`
    *,
    child_table (*)
  `)
```

### Ví dụ: Board → Columns → Cards
```typescript
const { data: board } = await supabase
  .from("boards")
  .select(`
    *,
    columns (
      *,
      cards (*)
    )
  `)
  .eq("id", boardId)
  .single();

// Kết quả:
{
  id: "board-1",
  title: "My Board",
  columns: [
    {
      id: "col-1",
      title: "To Do",
      cards: [
        { id: "card-1", title: "Task 1" },
        { id: "card-2", title: "Task 2" }
      ]
    },
    {
      id: "col-2", 
      title: "In Progress",
      cards: [...]
    }
  ]
}
```

---

## 🔍 **2. Các Query Patterns thông dụng**

### Pattern 1: Select specific fields
```typescript
// ❌ Tránh select * khi không cần
const { data } = await supabase
  .from("boards")
  .select("*");

// ✅ Chỉ select fields cần thiết
const { data } = await supabase
  .from("boards")
  .select("id, title, type, created_at");
```

### Pattern 2: Nested với filter
```typescript
// Lấy board với chỉ active columns
const { data } = await supabase
  .from("boards")
  .select(`
    *,
    columns!inner (
      *,
      cards (*)
    )
  `)
  .eq("columns.is_archived", false)
  .eq("id", boardId);
```

### Pattern 3: Count relationships
```typescript
// Đếm số lượng cards trong mỗi column
const { data } = await supabase
  .from("columns")
  .select("*, cards(count)")
  .eq("board_id", boardId);

// Kết quả:
[
  { id: "col-1", title: "To Do", cards: [{ count: 5 }] },
  { id: "col-2", title: "Done", cards: [{ count: 3 }] }
]
```

---

## 🎨 **3. Ordering và Sorting**

### Sort parent và child
```typescript
const { data } = await supabase
  .from("boards")
  .select(`
    *,
    columns (
      *,
      cards (*)
    )
  `)
  .order("created_at", { ascending: false })
  .order("position", { foreignTable: "columns", ascending: true })
  .order("position", { foreignTable: "columns.cards", ascending: true });
```

### Sort sau khi fetch (client-side)
```typescript
// Đơn giản hơn và dễ control
const sortedColumns = data.columns
  ?.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  ?.map((column) => ({
    ...column,
    cards: column.cards?.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  }));
```

---

## 🔄 **4. Real-time Subscriptions**

### Subscribe to changes
```typescript
// Subscribe to board changes
const channel = supabase
  .channel('board-changes')
  .on(
    'postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'boards',
      filter: `id=eq.${boardId}`
    },
    (payload) => {
      console.log('Board changed:', payload);
      // Update UI
    }
  )
  .subscribe();

// Cleanup
return () => supabase.removeChannel(channel);
```

---

## 🔐 **5. Row Level Security (RLS) Considerations**

### Query với RLS enabled
```typescript
// Supabase tự động apply RLS policies
// Chỉ return data mà user có permission

const { data } = await supabase
  .from("boards")
  .select(`
    *,
    columns (*)
  `)
  .eq("id", boardId);
// Nếu user không có permission → data = null hoặc error
```

### Bypass RLS (chỉ trong server-side với service role key)
```typescript
// ⚠️ CHỈ dùng server-side
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key
);

// Bỏ qua RLS
const { data } = await supabase
  .from("boards")
  .select("*");
```

---

## 📊 **6. Performance Tips**

### Tip 1: Limit nested queries
```typescript
// ❌ Tránh nested quá sâu
const { data } = await supabase
  .from("boards")
  .select(`
    *,
    columns (
      *,
      cards (
        *,
        comments (
          *,
          user (*)
        )
      )
    )
  `);

// ✅ Query riêng rẽ hoặc limit depth
const { data: board } = await supabase
  .from("boards")
  .select("*, columns(*)");

const { data: cards } = await supabase
  .from("cards")
  .select("*")
  .in("column_id", board.columns.map(c => c.id));
```

### Tip 2: Use pagination
```typescript
// Limit results
const { data } = await supabase
  .from("boards")
  .select("*")
  .range(0, 9) // First 10 items
  .limit(10);
```

### Tip 3: Index foreign keys
```sql
-- Trong Supabase SQL Editor
CREATE INDEX idx_columns_board_id ON columns(board_id);
CREATE INDEX idx_cards_column_id ON cards(column_id);
```

---

## 🛠️ **7. Error Handling**

### Pattern đúng
```typescript
const { data, error } = await supabase
  .from("boards")
  .select("*")
  .eq("id", boardId)
  .single();

if (error) {
  console.error("Database error:", error.message);
  // Handle specific errors
  if (error.code === "PGRST116") {
    // Not found
    return null;
  }
  throw error;
}

return data;
```

---

## 📝 **Summary cho dự án Trello Clone**

### ✅ Dùng nested select khi:
- Cần data của relationships ngay lập tức
- Số lượng nested items nhỏ (< 100)
- UI cần render all at once

### ✅ Dùng separate queries khi:
- Nested data lớn
- Cần pagination
- Load data progressively

### ✅ File structure:
```
lib/queries/
  ├── board-queries.ts    # Board-related queries
  ├── column-queries.ts   # Column-related queries  
  └── card-queries.ts     # Card-related queries
```
