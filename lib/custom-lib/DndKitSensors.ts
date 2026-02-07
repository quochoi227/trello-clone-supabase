import {
  MouseSensor as DndKitMouseSensor,
  TouchSensor as DndKitTouchSensor,
} from '@dnd-kit/core'

type SensorEvent = MouseEvent | TouchEvent

// Block DnD event propagation if element have "data-no-dnd" attribute
const handler = ({ nativeEvent: event }: { nativeEvent: SensorEvent }) => {
  let cur = event.target as HTMLElement | null

  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false
    }
    cur = cur.parentElement
  }

  return true
}

export class MouseSensor extends DndKitMouseSensor {
  static activators: (typeof DndKitMouseSensor.activators)[number][] = [
    { eventName: 'onMouseDown', handler }
  ]
}

export class TouchSensor extends DndKitTouchSensor {
  static activators: (typeof DndKitTouchSensor.activators)[number][] = [
    { eventName: 'onTouchStart', handler }
  ]
}