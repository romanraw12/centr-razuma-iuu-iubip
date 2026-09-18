import { Link } from 'react-router-dom'
import { CATEGORIES } from '@/lib/characters'

/* ВОССТАНОВЛЕНО: файл не дошёл в дампе; состав — по метаданным проекта
   (Разделы: Туризм и гостеприимство, юриспруденция, экономика и управление,
   фармация и сестринское дело). */

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-semibold text-foreground">Центр разума ЮУ ИУБиП</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Электронная библиотека образовательной литературы. Учебные пособия, конспекты и
            пошаговые объяснения по направлениям подготовки.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Разделы</h4>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/?category=${category.id}`}
                  className="transition-colors hover:text-foreground"
                >
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Сайт</h4>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>
              <Link to="/editor" className="transition-colors hover:text-foreground">
                Добавить книгу
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition-colors hover:text-foreground">
                Вход
              </Link>
            </li>
            <li>
              <Link to="/signup" className="transition-colors hover:text-foreground">
                Регистрация
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t px-4 py-4">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          © {year} ЮУ ИУБиП. Учебные материалы публикуются в образовательных целях.
        </p>
      </div>
    </footer>
  )
}

export default Footer