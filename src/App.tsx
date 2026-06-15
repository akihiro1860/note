import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import './App.css'

const KEYWORDS = ['60÷20', '84÷21', '86÷23', '78÷19', '87÷25', '153÷24', '345÷21']
const SLOT_COUNT = KEYWORDS.length

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Card { id: string; text: string }

const initialCards: Card[] = shuffled(KEYWORDS.map((text, i) => ({ id: String(i), text })))
const cardMap: Record<string, Card> = Object.fromEntries(initialCards.map(c => [c.id, c]))

function DraggableCard({ id, text, inSlot }: { id: string; text: string; inSlot?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`card${isDragging ? ' dragging' : ''}${inSlot ? ' in-slot' : ''}`}
      {...attributes}
      {...listeners}
    >
      {text}
    </div>
  )
}

function PoolZone({ cardIds }: { cardIds: string[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'pool' })
  return (
    <div className={`pool${isOver ? ' over' : ''}`} ref={setNodeRef}>
      {cardIds.length === 0
        ? <span className="empty-hint">すべて配置済み</span>
        : cardIds.map(id => <DraggableCard key={id} id={id} text={cardMap[id].text} />)
      }
    </div>
  )
}

function SlotZone({ index, cardId }: { index: number; cardId: string | null }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${index}` })
  return (
    <div className={`slot${isOver ? ' over' : ''}`} ref={setNodeRef}>
      <span className="slot-number">{index + 1}</span>
      <div className="slot-content">
        {cardId
          ? <DraggableCard id={cardId} text={cardMap[cardId].text} inSlot />
          : <span className="empty-hint">ドロップ</span>
        }
      </div>
    </div>
  )
}

export default function App() {
  const [slots, setSlots] = useState<(string | null)[]>(Array(SLOT_COUNT).fill(null))
  const [pool, setPool] = useState<string[]>(initialCards.map(c => c.id))
  const [memo, setMemo] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over) return

    const draggedId = String(active.id)
    const target = String(over.id)

    const sourceSlot = slots.findIndex(s => s === draggedId)
    const fromPool = pool.includes(draggedId)

    if (target === 'pool') {
      if (fromPool) return
      setSlots(prev => { const n = [...prev]; n[sourceSlot] = null; return n })
      setPool(prev => [...prev, draggedId])
      return
    }

    if (target.startsWith('slot-')) {
      const targetSlot = parseInt(target.replace('slot-', ''))
      if (sourceSlot === targetSlot) return

      const displaced = slots[targetSlot]

      setSlots(prev => {
        const n = [...prev]
        n[targetSlot] = draggedId
        if (sourceSlot !== -1) n[sourceSlot] = displaced
        return n
      })

      if (fromPool) {
        setPool(prev => {
          const n = prev.filter(id => id !== draggedId)
          if (displaced) n.push(displaced)
          return n
        })
      }
    }
  }

  const activeCard = activeId ? cardMap[activeId] : null

  return (
    <div className="app">
      <h1>キーワード並び替え</h1>
      <p className="subtitle">カードをドラッグして順番に並べてください</p>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <section>
          <h2 className="section-title">カード</h2>
          <PoolZone cardIds={pool} />
        </section>

        <section>
          <h2 className="section-title">並び順</h2>
          <div className="slots">
            {Array.from({ length: SLOT_COUNT }, (_, i) => (
              <SlotZone key={i} index={i} cardId={slots[i]} />
            ))}
          </div>
        </section>

        <DragOverlay>
          {activeCard ? <div className="card overlay">{activeCard.text}</div> : null}
        </DragOverlay>
      </DndContext>

      <section className="memo-section">
        <h2 className="section-title">並び替えた理由</h2>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="並び替えた理由を入力してください..."
          rows={5}
        />
      </section>
    </div>
  )
}
