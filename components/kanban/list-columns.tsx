"use client"

import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Board, Column } from "./kanban-board";
import { KanbanColumn } from "./kanban-column";
import { Button } from "../ui/button";
import { CirclePlus, X } from "lucide-react";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { generatePlaceholderCard } from "@/utils/formatters";
// import { cloneDeep } from "lodash";
import { createColumn } from "@/actions/column-action";
import { useBoardStore } from "@/stores/board-store";
import CardDetail from "@/app/boards/[id]/_components/card/card-detail";

export function ListColumns({ columns }: { columns: Board["columns"] }) {
  const { currentActiveBoard, setCurrentActiveBoard, subscribeToBoard, subscribeToColumn } = useBoardStore()
  // const [lastAddedColumnId, setLastAddedColumnId] = useState<string | null>(null);
  // SortableContent yêu cầu items dạng ['id-1', 'id-2'] chứ không phải [{id: 'id-1', id: 'id-2'}]
  // nếu không đúng thì vẫn kéo thả được nhưng không có animation
  const [openNewColumnForm, setOpenNewColumnForm] = useState<boolean>(false)
  const [newColumnTitle, setNewColumnTitle] = useState<string>('')
  const toggleOpenNewColumnForm = () => {
    setOpenNewColumnForm(!openNewColumnForm)
    setNewColumnTitle('')
  }

  const addNewColumn = async () => {
    if (!newColumnTitle) {
      // không cho tạo nếu title trống
      // toast("Vui lòng nhập tên cột", {
      //     description: "Không thể tạo cột với tên trống.",
      //   })
      alert("Column title is required")
      return
    }

    const newColumnData = {
      title: newColumnTitle
    }

    const { data: createdColumn } = await createColumn({
      ...newColumnData,
      boardId: currentActiveBoard?.id as string, // boardId tạm thời để trống vì chưa có Redux store
    })

    if (createdColumn) {
      createdColumn.cards = [generatePlaceholderCard(createdColumn as Column)]
      createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn as Column).id]
    }
    // tự làm lại state Board thay vì gọi lại fetchBoardAPI
    /**
     * Đoạn này sẽ dính lỗi object is not extensible bởi dù đã copy/clone giá trị newBoard nhưng bản chất của
     * spread operator là Shallow Copy/Clone nên dính phải rules Immutability trong Redux Toolkit, không được
     * dùng hàm push (sửa giá trị trực tiếp), cách đơn giản nhanh gọn nhất ở trường hợp này của  chúng ta là
     * dùng tới Deep Copy/Clone toàn bộ cái Board cho dễ hiểu và code ngắn gọn
     */
    const newBoard = { ...currentActiveBoard }
    newBoard.columns?.push(createdColumn as Column)
    newBoard.columnOrderIds?.push(createdColumn?.id as string)

    /**
     * Ngoài cách đó ra thì vẫn có thể dùng array.concat thay cho push như docs của Redux Toolkit ở trên vì push
     * như đã nói nó sẽ thay đổi giá trị mảng trực tiếp, còn thằng concat thì nó merge - ghép mảng lại và tạo ra
     * một mảng mới để chúng ta gán lại giá trị nên không vấn đề gì
     */
    // const newBoard = { ...board }
    // newBoard.columns = newBoard.columns.concat([createdColumn])
    // newBoard.columnOrderIds = newBoard.columnOrderIds.concat([createdColumn._id])

    // setBoard(newBoard)
    // Cập nhật dữ liệu trong Redux (Redux store)
    // setCurrentActiveProject(newProject as typeof currentActiveProject)
    setCurrentActiveBoard(newBoard as typeof currentActiveBoard)

    toggleOpenNewColumnForm()
    setNewColumnTitle('')
  }

  const handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // Thêm dòng này để khi Enter không bị nhảy dòng
      if (!(event.target as HTMLInputElement)?.value) return

      addNewColumn()
    }
  }

  useEffect(() => {
    if (currentActiveBoard?.id) {
      subscribeToBoard(currentActiveBoard.id);
      subscribeToColumn(currentActiveBoard.id)
    }
  }, [currentActiveBoard?.id, subscribeToBoard]);

  const columnIds = columns?.map((column) => column.id)

  return (
    <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
      <div className="w-full h-full flex gap-4 overflow-x-auto pb-4 scrollbar-custom">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column}  />
        ))}
        {!openNewColumnForm
          ? <div className="w-60 min-w-60 h-fit">
            
            <Button
              onClick={toggleOpenNewColumnForm}
              className="w-full"
            >
              <CirclePlus />
              Add new column
            </Button>
          </div>
          : <div className="min-w-60 w-60 p-2 rounded-md h-fit flex flex-col gap-1">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={handleKeydown}
              type="text"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <Button
                className="interceptor-loading"
                onClick={addNewColumn}
              >
                Add column
              </Button>
              <X
                onClick={toggleOpenNewColumnForm}
              />
            </div>
          </div>
        }
        <CardDetail />
      </div>
    </SortableContext>
  )
}
