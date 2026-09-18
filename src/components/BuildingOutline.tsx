import { BookOpen, Layers, Users } from 'lucide-react'
import { CATEGORIES } from '@/lib/characters'
import { SAMPLE_BOOKS } from '@/lib/libraryData'

/* ВОССТАНОВЛЕНО: файл не дошёл в дампе. Название и состав («обзор разделов
   библиотеки») выведены из метаданных проекта и design-system.json. */

export function BuildingOutline() {
  const items = [
    { icon: Layers, value: CATEGORIES.length, label: 'раздела' },
    { icon: BookOpen, value: SAMPLE_BOOKS.length, label: 'издания' },
    { icon: Users, value: 4, label: 'героя-ассистента' },
  ]

  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      {items.map(({ icon: Icon, value, label }) => (
        <div
          key={label}
          className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            {label}
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default BuildingOutline