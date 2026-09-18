import * as React from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'

/* ВОССТАНОВЛЕНО: страница не дошла в дампе; маршрут /login, layout bare.
   Ошибку берём через lastError() — error как состояние React внутри
   обработчика ещё null (см. комментарий в useAuth). */

export default function Login() {
  const { signIn, lastError, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  usePageMeta({ title: 'Вход', description: 'Вход в личный кабинет Центра разума ЮУ ИУБиП.' })

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (await signIn(email, password)) {
      navigate(from, { replace: true })
    } else {
      toast.error(lastError() || 'Не удалось войти')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
          <CardDescription>
            Войдите, чтобы добавлять и редактировать издания в каталоге.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.ru"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              Войти
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link to="/signup" className="text-primary underline-offset-4 hover:underline">
              Зарегистрироваться
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">
              Вернуться в каталог
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}