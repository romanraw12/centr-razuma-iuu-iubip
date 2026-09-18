import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES } from '@/lib/characters'
import { SAMPLE_BOOKS } from '@/lib/libraryData'
import { useData } from '@/hooks/useData'
import { usePageMeta } from '@/hooks/usePageMeta'

/* ВОССТАНОВЛЕНО: страница не дошла в дампе. Маршруты /editor и /editor/:id
   из routes.tsx (оба под ProtectedRoute). Формы — react-hook-form + zod,
   как в зависимостях package.json. */

const schema = z.object({
  title: z.string().min(3, 'Название не короче 3 символов'),
  author: z.string().min(2, 'Укажите автора'),
  year: z.coerce
    .number()
    .int('Год — целое число')
    .min(1900, 'Слишком ранний год')
    .max(new Date().getFullYear() + 1, 'Год ещё не наступил'),
  categoryId: z.enum(['tourism', 'law', 'economics', 'pharmacy']),
  annotation: z.string().min(20, 'Аннотация не короче 20 символов'),
  content: z.string().min(50, 'Текст издания не короче 50 символов'),
})

type FormValues = z.infer<typeof schema>

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const existing = isEdit ? SAMPLE_BOOKS.find((book) => book.id === id) : undefined

  const { insert, update } = useData('books', { enabled: false })

  usePageMeta({
    title: isEdit ? 'Редактирование издания' : 'Добавление издания',
    description: 'Форма публикации учебного издания в электронной библиотеке.',
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      author: 'Центр разума ЮУ ИУБиП',
      year: new Date().getFullYear(),
      categoryId: 'tourism',
      annotation: '',
      content: '',
    },
  })

  useEffect(() => {
    if (!existing) return
    form.reset({
      title: existing.title,
      author: existing.author,
      year: existing.year,
      categoryId: existing.categoryId,
      annotation: existing.annotation,
      content: existing.content,
    })
  }, [existing, form])

  const onSubmit = async (values: FormValues) => {
    if (isEdit && existing) {
      const ok = await update(existing.id, values as never)
      if (ok) {
        toast.success('Издание обновлено')
        navigate(`/book/${existing.id}`)
      } else {
        toast.error('Не удалось сохранить изменения: база данных не ответила')
      }
      return
    }

    const created = await insert(values as never)
    if (created) {
      toast.success('Издание добавлено в каталог')
      navigate('/')
    } else {
      toast.error('Не удалось добавить издание: база данных не подключена')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          В каталог
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Редактирование издания' : 'Новое издание'}</CardTitle>
          <CardDescription>
            Заполните карточку: название, автор, раздел каталога, аннотация и текст.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input placeholder="Например: Основы права" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Автор</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Год издания</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="numeric" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Раздел каталога</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите раздел" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.emoji} {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Раздел определяет героя-ассистента, который будет объяснять тему.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annotation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Аннотация</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[96px]"
                        placeholder="О чём издание и кому оно будет полезно"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Текст издания</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[240px] font-mono text-sm"
                        placeholder={'## Заголовок раздела\n\nТекст абзаца…'}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Поддерживается простая разметка: строка, начинающаяся с «##», становится
                      заголовком, пустая строка разделяет абзацы.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? 'Сохранить изменения' : 'Добавить в каталог'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/">Отмена</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}