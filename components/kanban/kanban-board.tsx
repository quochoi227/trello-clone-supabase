"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Active,
  closestCorners,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  getFirstCollision,
  Over,
  pointerWithin,
  rectIntersection,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import { ListColumns } from "./list-columns";
import { KanbanColumn } from "./kanban-column";
import { MouseSensor, TouchSensor } from "@/lib/custom-lib/DndKitSensors";
import { cloneDeep, isEmpty } from "lodash";
import { generatePlaceholderCard } from "@/utils/formatters";

export interface Card {
  _id: string;
  boardId: string;
  columnId: string;
  title?: string;
  description?: string | null;
  cover?: string | null;
  memberIds?: string[];
  comments?: string[];
  attachments?: string[];
  FE_PlaceholderCard?: boolean;
}

export interface Column {
  _id: string;
  boardId: string;
  title: string;
  cardOrderIds: string[];
  cards: Card[];
}

export interface Board {
  _id: string;
  title: string;
  description: string;
  type: string;
  ownerIds: string[];
  memberIds: string[];
  columnOrderIds: string[];
  columns: Column[];
}

interface KanbanBoardProps {
  initialData: Board;
}

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
} as const

type ActiveDragItemType = typeof ACTIVE_DRAG_ITEM_TYPE[keyof typeof ACTIVE_DRAG_ITEM_TYPE] | null


export function KanbanBoard({ initialData }: KanbanBoardProps) {
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  // Yêu cầu chạm và giữ 250ms và dung sai 5px thì hiệu ứng mới được kích hoạt
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 50 } })

  // Ưu tiên sử dụng 2 sensor là mouseSensor và touchSensor để không bị bug
  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [board] = useState<Board>(initialData);
  const [orderedColumns, setOrderedColumns] = useState<Column[]>([])
  const [activeDragItemId, setActiveDragItemId] = useState<UniqueIdentifier | null>(null)
  const [activeDragItemType, setActiveDragItemType] = useState<ActiveDragItemType>(null)
  const [activeDragItemData, setActiveDragItemData] = useState<Column | Card | null>(null)
  const [oldColumn, setOldColumn] = useState<Column | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)

  useEffect(() => {
    // Column đã được sắp xếp ở component cao nhất (_id.jsx) nên chỉ cần set thẳng, không cần sắp xếp lại
    setOrderedColumns(board.columns)
  }, [board])

  const findColumnByCardId = (cardId: UniqueIdentifier): Column | undefined => {
    return orderedColumns.find((column) => column.cards.map((card) => card._id).includes(cardId as string))
  }

  const moveCardBetweenDifferentColumns = (
    overColumn: Column,
    overCardId: UniqueIdentifier,
    active: Active,
    over: Over,
    activeColumn: Column,
    activeDraggingCardId: UniqueIdentifier,
    activeDraggingCardData: Card,
    triggerFrom: 'handleDragOver' | 'handleDragEnd'
  ): void => {
    let nextColumns: Column[] = []
    
    setOrderedColumns((prevColumns) => {
      // tìm vị trí của active card sắp được thả
      const overCardIndex = overColumn.cards.findIndex((card) => card._id === overCardId)

      // đây là logic tính "cardIndex mới" (trên hoặc dưới của overCard) lấy chuẩn ra từ code của thư viện
      const isBelowOverItem =
        over && active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0

      const newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn.cards.length + 1
      // clone mảng orderedColumns ra 1 mảng mới
      nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find((column) => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find((column) => column._id === overColumn._id)
      if (nextActiveColumn) {
        // xóa card ra khỏi active column
        nextActiveColumn.cards = nextActiveColumn.cards.filter((card) => card._id !== activeDraggingCardId)

        nextActiveColumn.cards = nextActiveColumn.cards.filter((card) => !card.FE_PlaceholderCard)
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn as Column)]
        }

        // cập nhật lại mảng cardsOrderIds
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map((card) => card._id)
      }

      if (nextOverColumn) {
        // kiểm tra xem card đang kéo có tồn tại trong overColumn hay chưa, nếu có thì cần phải xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter((card) => card._id !== activeDraggingCardId)
        // đối với trường hợp dragEnd thì phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo giữa 2 columns khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // thêm card đang kéo vào overColumn theo index mới
        nextOverColumn.cards.splice(
          newCardIndex,
          0,
          rebuild_activeDraggingCardData
        )

        // cập nhật lại mảng cardsOrderIds
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map((card) => card._id)
      }

      return nextColumns
    })
    
    // Nếu func này được gọi từ handleDragEnd thì mới xử lý gọi API
    if (triggerFrom === 'handleDragEnd') {
      // Gọi lên hàm moveCardToDifferentColumn ở component cha cao nhất (_id.jsx)
      moveCardToDifferentColumn(activeDraggingCardId, oldColumn?._id, overColumn._id, nextColumns)
    }
  }

  const handleDragStart = (event: DragStartEvent): void => {
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current as Column | Card)

    if (event?.active?.data?.current?.columnId) {
      setOldColumn(findColumnByCardId(event?.active?.id) ?? null)
    }
  }

  // const handleDragOver = (event: DragOverEvent) => {
  //   const { active, over } = event;
  //   if (!over) return;

  //   const activeCardId = active.id as string;
  //   const overId = over.id as string;

  //   if (activeCardId === overId) return;

  //   const activeColumn = board.columns.find((col) =>
  //     col.cards.some((card) => card._id === activeCardId)
  //   );
  //   const overColumn = board.columns.find(
  //     (col) =>
  //       col._id === overId || col.cards.some((card) => card._id === overId)
  //   );

  //   if (!activeColumn || !overColumn) return;

  //   if (activeColumn._id !== overColumn._id) {
  //     setBoard((prev) => {
  //       const newColumns = prev.columns.map((col) => {
  //         if (col._id === activeColumn._id) {
  //           return {
  //             ...col,
  //             cards: col.cards.filter((card) => card._id !== activeCardId),
  //             cardOrderIds: col.cardOrderIds.filter((id) => id !== activeCardId),
  //           };
  //         }
  //         if (col._id === overColumn._id) {
  //           const overCardIndex = col.cards.findIndex(
  //             (card) => card._id === overId
  //           );
  //           const activeCard = activeColumn.cards.find(
  //             (card) => card._id === activeCardId
  //           );
  //           if (!activeCard) return col;

  //           const updatedCard = { ...activeCard, columnId: col._id };
  //           const newCards = [...col.cards];
  //           const newCardOrderIds = [...col.cardOrderIds];

  //           if (overCardIndex >= 0) {
  //             newCards.splice(overCardIndex, 0, updatedCard);
  //             newCardOrderIds.splice(overCardIndex, 0, activeCardId);
  //           } else {
  //             newCards.push(updatedCard);
  //             newCardOrderIds.push(activeCardId);
  //           }

  //           return {
  //             ...col,
  //             cards: newCards,
  //             cardOrderIds: newCardOrderIds,
  //           };
  //         }
  //         return col;
  //       });

  //       return { ...prev, columns: newColumns };
  //     });
  //   }
  // };

  const handleDragOver = (event: DragOverEvent): void => {
    // không làm gì nếu như đang kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return
    const { active, over } = event
    // nếu kéo ra ngoài thì return
    if (!active || !over) return
    // card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // card được thay chỗ
    const { id: overCardId } = over
    // tìm 2 columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // nếu không tồn tại thì return để tránh crash
    if (!activeColumn || !overColumn) return
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData as Card,
        'handleDragOver'
      )
    }
  }

  const moveCardInTheSameColumn = (dndOrderedCards: Card[] | undefined, dndOrderedCardIds: UniqueIdentifier[] | undefined, columnId: UniqueIdentifier | undefined) => {
    // Update cho chuẩn dữ liệu state Board
    /**
     * Cannot assign to read only property 'cards' of object
     * Trường hợp Immutability ở đây đã đụng tới giá trị cards đang được coi là chỉ đọc - read only (nested object)
     */
    // const newBoard = { ...board }
    const newProject = cloneDeep(board)
    const columnToUpdate = newProject?.columns.find((column: Column) => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards as Card[]
      columnToUpdate.cardOrderIds = dndOrderedCardIds as string[]
    }
    // setBoard(newBoard)
    // setCurrentActiveProject(newProject as Project)
    // Gọi API update Column
    // updateColumnDetailsAPI(columnId as UniqueIdentifier, { cardOrderIds: dndOrderedCardIds } as Column)
  }

  const moveColumns = (dndOrderedColumns: Column[]) => {
    const dndOrderedColumnIds = dndOrderedColumns.map(c => c._id)
    const newProject = { ...board }
    /**
     * Trường hợp dùng spread operator này thì lại không sao bởi vì ở đây chúng ta không dùng push như ở trên
     * làm thay đổi trực tiếp kiểu mở rộng mảng, mà chỉ đang gán lại toàn bộ giá trị columns và columnOrderIds
     * bằng 2 mảng mới. Tương tự như cách làm concat ở trường hợp createNewColumn
     */
    newProject.columns = dndOrderedColumns
    newProject.columnOrderIds = dndOrderedColumnIds

    // setCurrentActiveProject(newProject as Project)

    // Gọi API update Board
    // updateProjectDetailsAPI(newProject._id as UniqueIdentifier, { columnOrderIds: newProject.columnOrderIds } as Project)
  }

  const moveCardToDifferentColumn = (
    currentCardId: UniqueIdentifier | undefined,
    prevColumnId: UniqueIdentifier | undefined,
    nextColumnId: UniqueIdentifier | undefined,
    dndOrderedColumns: Column[]
  ) => {
    // console.log('currentCardId', currentCardId)
    // console.log('prevColumnId', prevColumnId)
    // console.log('nextColumnId', nextColumnId)
    // console.log('dndOrderedColumns', dndOrderedColumns)

    const dndOrderedColumnIds = dndOrderedColumns.map(c => c._id)
    // Không vi phạm Immutability của Redux
    const newProject = { ...board }
    newProject.columns = dndOrderedColumns
    newProject.columnOrderIds = dndOrderedColumnIds
    // setBoard(newBoard)
    // setCurrentActiveProject(newProject as Project)

    // Gọi API xử lý phía BE
    // mảng gửi về BE không được có placeholder
    let prevCardOrderIds = dndOrderedColumns.find((column) => column._id === prevColumnId)?.cardOrderIds
    if (prevCardOrderIds?.[0].includes('placeholder-card')) {
      prevCardOrderIds = []
    }

    let nextCardOrderIds = dndOrderedColumns.find((column) => column._id === nextColumnId)?.cardOrderIds
    if (nextCardOrderIds?.[0].includes('placeholder-card')) {
      nextCardOrderIds = []
    }
    // moveCardToDifferentColumnAPI({
    //   currentCardId,
    //   prevColumnId,
    //   prevCardOrderIds,
    //   nextColumnId,
    //   nextCardOrderIds
    // })
  }

  // const handleDragEnd = (event: DragEndEvent) => {
  //   const { active, over } = event;

  //   if (!over) return;

  //   const activeCardId = active.id as string;
  //   const overCardId = over.id as string;

  //   if (activeCardId === overCardId) return;

  //   const activeColumn = board.columns.find((col) =>
  //     col.cards.some((card) => card._id === activeCardId)
  //   );
  //   const overColumn = board.columns.find((col) =>
  //     col.cards.some((card) => card._id === overCardId)
  //   );

  //   if (!activeColumn || !overColumn) return;

  //   if (activeColumn._id === overColumn._id) {
  //     setBoard((prev) => {
  //       const newColumns = prev.columns.map((col) => {
  //         if (col._id === activeColumn._id) {
  //           const oldIndex = col.cardOrderIds.indexOf(activeCardId);
  //           const newIndex = col.cardOrderIds.indexOf(overCardId);
  //           const newCardOrderIds = arrayMove(
  //             col.cardOrderIds,
  //             oldIndex,
  //             newIndex
  //           );
  //           const newCards = newCardOrderIds
  //             .map((id) => col.cards.find((card) => card._id === id))
  //             .filter((card): card is Card => card !== undefined);

  //           return {
  //             ...col,
  //             cardOrderIds: newCardOrderIds,
  //             cards: newCards,
  //           };
  //         }
  //         return col;
  //       });

  //       return { ...prev, columns: newColumns };
  //     });
  //   }
  // };

  const handleDragEnd = (event: DragEndEvent): void => {
    console.log('Drag End Event:', event)
    const { active, over } = event
    if (!active || !over) return

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // card được thay chỗ
      const { id: overCardId } = over
      // tìm 2 columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // nếu không tồn tại thì return để tránh crash
      if (!activeColumn || !overColumn) return
      // dùng oldColumn._id hoặc activeDragItemData.columnId được set từ lúc drag start
      if (oldColumn!._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData as Card,
          'handleDragEnd'
        )
      } else {
        // xử lý kéo thả card trong cùng column
        const oldCardIndex = oldColumn?.cards?.findIndex((card) => card._id === activeDragItemId)
        const newCardIndex = overColumn?.cards?.findIndex((card) => card._id === overCardId)

        // dùng arrayMove cho card trong cùng column tương tự như kéo column trong cùng project
        const dndOrderedCards = arrayMove(oldColumn?.cards as Card[], oldCardIndex as number, newCardIndex)
        const dndOrderedCardIds = dndOrderedCards.map((card) => card._id)
        setOrderedColumns((prevColumns) => {
          // clone mảng orderedColumns ra 1 mảng mới
          const nextColumns = cloneDeep(prevColumns)

          const targetColumn = nextColumns.find((column) => column._id === overColumn._id)
          if (targetColumn) {
            targetColumn.cards = dndOrderedCards
          }
          if (targetColumn) {
            targetColumn.cardOrderIds = dndOrderedCardIds
          }
          return nextColumns
        })
        moveCardInTheSameColumn(dndOrderedCards, dndOrderedCardIds, oldColumn?._id)
      }
    } else if (activeDragItemType == ACTIVE_DRAG_ITEM_TYPE.COLUMN && active.id !== over.id) {
      const oldColumnIndex = orderedColumns.findIndex((column) => column._id === active.id)
      const newColumnIndex = orderedColumns.findIndex((column) => column._id === over.id)
      // Dùng arrayMove của Dnd Kit để sắp xếp lại mảng ban đầu
      const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
      // const dndOrderedColumnsIds = dndOrderedColumns.map((column) => column._id)
      setOrderedColumns(dndOrderedColumns)
      // Xử lý gọi API
      moveColumns(dndOrderedColumns)
    }
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumn(null)
  }

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    // trường hợp kéo column thì dùng closestCorners là chuẩn nhất
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    // tìm những điểm giao nhau với con trỏ
    const pointerIntersections = pointerWithin(args)

    if (!pointerIntersections?.length) return []

    // thuật toán phát hiện va chạm sẽ trả về 1 mảng các va chạm ở đây
    const intersections = pointerIntersections?.length > 0 ? pointerIntersections : rectIntersection(args)
    // tìm overId đầu tiên cho các intersections ở trên
    let overId = getFirstCollision(intersections, 'id')
    if (overId) {
      // nếu overId là column thì sẽ tìm tới cardId gần nhất bên trong khu vực va chạm đó dựa vào
      // thuật toán phát hiện va chạm closestCenter hoặc closestCorners đều được. Tuy nhiên ở đây
      // dùng closestCorners sẽ mượt mà hơn
      const checkColumn = orderedColumns.find((column) => column._id === overId)

      if (checkColumn) {
        // console.log('-------------')
        // console.log('overId before:', overId)
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter((container) => {
            return (checkColumn?.cardOrderIds?.includes(container.id as string))
          })
        })[0]?.id
        // console.log('overId after:', overId)
        // console.log('-------------')
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    // nếu overId là null thì return ref cuối cùng trước đó
    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumns])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      
      <ListColumns columns={orderedColumns} />

      <DragOverlay>
        {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <KanbanColumn column={activeDragItemData as Column} />}
        {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <KanbanCard card={activeDragItemData as Card} />}
      </DragOverlay>
    </DndContext>
  );
}
