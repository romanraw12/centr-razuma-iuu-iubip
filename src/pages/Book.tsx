import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Calendar, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CharacterAvatar } from '@/components/CharacterAvatar'
import EmptyState from '@/components/EmptyState'
import { getCharacterByCategory } from '@/lib/characters'
import { SAMPLE_BOOKS, getBookById } from '@/lib/libraryData'
import { usePageMeta } from '@/hooks/usePageMeta'

/* ВОССТАНОВЛЕНО: страница не дошла в дампе. Раскладка — по design-system.json:
   hero, контент 2/1 с сайдбаром, блок related. */

export default function Book() {
  const { id = '' } = useParams()
  const book = getBookById(id)

  usePageMeta({
    title: book ? book.title : 'Книга не найдена',
    description: book?.annotation,
  })

  if (!book) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="Издание не найдено"
          description="Возможно, ссылка устарела или книгу убрали из каталога."
          actionLabel="Вернуться в каталог"
          onAction={() => {
            window.location.href = '/'
          }}
        />
      </div>
    )
  }

  const character = getCharacterByCategory(book.categoryId)
  const related = SAMPLE_BOOKS.filter(
    (item) => item.categoryId === book.categoryId && item.id !== book.id
  )

  return (
    <div>
      <section className="bg-primary py-12 text-primary-foreground md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm opacity-90 hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Каталог
          </Link>
          <h1 className="mt-4 max-w-3xl text-2xl font-semibold leading-tight md:text-4xl">
            {book.title}
          </h1>
          <p className="mt-3 text-sm opacity-90">
            {book.author} · {book.year} · {book.pages} с.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <article className="md:col-span-2">
          <div className="flex h-32 items-center justify-center rounded-lg bg-primary/10 text-5xl">
            <span aria-hidden="true">{book.cover}</span>
          </div>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Аннотация</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{book.annotation}</p>

          <Separator className="my-8" />

          <h2 className="text-xl font-semibold text-foreground">Содержание</h2>
          <div className="mt-4 space-y-4">
            {book.content.split('\n\n').map((block, index) =>
              block.startsWith('##') ? (
                <h3 key={index} className="text-lg font-medium text-foreground">
                  {block.replace(/^##\s*/, '')}
                </h3>
              ) : (
                <p key={index} className="text-sm leading-relaxed text-muted-foreground">
                  {block}
                </p>
              )
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to={`/read/${book.id}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Читать
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/?category=${book.categoryId}`}>Ещё в этом разделе</Link>
            </Button>
          </div>
        </article>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Об издании</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {book.year} год
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                {book.pages} страниц
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {book.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {character && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Герой раздела</CardTitle>
                <CardDescription>
                  {character.name} объяснит тему по шагам и проведёт тест.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <CharacterAvatar id={character.id} size={44} />
                <div>
                  <p className="text-sm font-medium text-foreground">{character.name}</p>
                  <p className="text-xs text-muted-foreground">{character.role}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="bg-muted/50 py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-xl font-semibold text-foreground">Похожие издания</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Card
                  key={item.id}
                  className="transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <CardHeader>
                    <span className="text-3xl" aria-hidden="true">
                      {item.cover}
                    </span>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription>{item.annotation}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/book/${item.id}`}>Открыть</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}