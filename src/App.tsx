import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableCard } from './SortableCard'
import './App.css'

interface Card {
  id: string
  text: string
}

const initialCards: Card[] = [
  { id: '1', text: 'アイデア' },
  { id: '2', text: '計画' },
  { id: '3', text: '実行' },
  { id: '4', text: '振り返り' },
  { id: '5', text: '改善' },
  { id: '6', text: '成長' },
]

export default function App() {
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [newKeyword, setNewKeyword] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  function addCard() {
    const trimmed = newKeyword.trim()
    if (!trimmed) return
    setCards((prev) => [
      ...prev,
      { id: Date.now().toString(), text: trimmed },
    ])
    setNewKeyword('')
  }

  function removeCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="app">
      <h1>キーワードカード</h1>
      <p className="subtitle">ドラッグ＆ドロップで順番を並び替えられます</p>

      <div className="add-form">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCard()}
          placeholder="新しいキーワードを入力..."
        />
        <button onClick={addCard}>追加</button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={rectSortingStrategy}>
          <div className="card-grid">
            {cards.map((card) => (
              <SortableCard
                key={card.id}
                id={card.id}
                text={card.text}
                onRemove={removeCard}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
