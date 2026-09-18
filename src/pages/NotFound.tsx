import { Link } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePageMeta } from '@/hooks/usePageMeta'

/* ВОССТАНОВЛЕНО: страница не дошла в дампе; маршрут «*» из routes.tsx. */

export default function NotFound() {
  usePageMeta({ title: 'Страница не найдена' })

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Compass className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold text-foreground">Страница не найдена</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Такой страницы нет — возможно, ссылка устарела. Вернитесь в каталог, там четыре
        раздела литературы и герои, которые всё объяснят.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            На главную
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/?category=all">В каталог</Link>
        </Button>
      </div>
    </div>
  )
}