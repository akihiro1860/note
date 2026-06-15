import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  id: string
  text: string
  onRemove: (id: string) => void
}

export function SortableCard({ id, text, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="card" {...attributes}>
      <div className="card-drag-handle" {...listeners}>
        ⠿
      </div>
      <span className="card-text">{text}</span>
      <button
        className="card-remove"
        onClick={() => onRemove(id)}
        aria-label="削除"
      >
        ×
      </button>
    </div>
  )
}
