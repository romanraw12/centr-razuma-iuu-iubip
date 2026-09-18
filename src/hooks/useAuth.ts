import { useState, useEffect, useCallback, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabase } from '../lib/supabase'
import type { AuthUser } from '../types'

export type { AuthUser }

interface UseAuthReturn {
  /** Current authenticated user or null. */
  user: AuthUser | null
  /** Loading state during auth operations. */
  loading: boolean
  /** Error message if any. Render it; do NOT read it inside a submit handler. */
  error: string | null
  /**
   * Текст последней ошибки, доступный СИНХРОННО сразу после await.
   *
   * `error` — это состояние React: значение, полученное деструктуризацией,
   * заморожено на том рендере, где его прочитали. Внутри обработчика
   * `const ok = await signIn(...)` оно всё ещё null, поэтому привычное
   * `toast.error(error || 'запасной текст')` ВСЕГДА показывает запасной
   * текст, и настоящая причина отказа («Пароль слишком короткий…»,
   * «Пользователь с таким e-mail уже зарегистрирован») до посетителя не
   * доходит. lastError() читает ref и отдаёт актуальное сообщение:
   *
   *   const { signIn, lastError } = useAuth()
   *   if (await signIn(email, password)) navigate('/')
   *   else toast.error(lastError() || 'Не удалось войти')
   */
  lastError: () => string | null
  /** Whether user is authenticated. */
  isAuthenticated: boolean
  /** Create a new account with email and password. */
  signUp: (email: string, password: string, displayName?: string) => Promise<boolean>
  /** Sign in with email and password. */
  signIn: (email: string, password: string) => Promise<boolean>
  /** Sign out the current user. */
  signOut: () => Promise<boolean>
  /** Send password reset email. */
  resetPassword: (email: string) => Promise<boolean>
  /** Clear current error. */
  clearError: () => void
}

/**
 * Текст ошибки, понятный посетителю сайта.
 *
 * Supabase Auth отвечает JSON. Если эндпоинт авторизации не поднят,
 * запрос попадает на HTML-страницу ошибки (404/405 от прокси), и SDK
 * отдаёт наружу сырое сообщение парсера — «Unexpected token '<' ...
 * is not valid JSON». Посетителю оно не говорит ничего. Такие случаи
 * сводим к одной честной фразе: дело не в логине и не в пароле.
 *
 * Язык по умолчанию — русский: сайты платформы делаются для РФ. Сам
 * сервер отвечает по-русски, поэтому осмысленные ответы («Пароль
 * слишком короткий: нужно не меньше 8 символов») проходят как есть.
 */
const AUTH_UNAVAILABLE =
  'Вход на сайте пока не работает: сервис авторизации не ответил. Сообщите, пожалуйста, владельцу сайта.'

const AUTH_NOT_CONFIGURED =
  'Вход на сайте пока не работает: к нему не подключена база данных.'

const AUTH_NETWORK =
  'Не удалось связаться с сервисом авторизации. Проверьте соединение и попробуйте ещё раз.'

const SIGN_UP_FAILED = 'Не удалось создать аккаунт.'
const SIGN_IN_FAILED = 'Не удалось войти. Проверьте e-mail и пароль.'
const SIGN_OUT_FAILED = 'Не удалось выйти из аккаунта.'
const RESET_FAILED = 'Не удалось отправить письмо для восстановления пароля.'

function authErrorMessage(err: unknown, fallback: string): string {
  const raw =
    typeof err === 'string'
      ? err
      : err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message ?? '')
        : ''

  const text = raw.trim()
  if (!text) return fallback

  const lower = text.toLowerCase()

  // Ответ пришёл HTML-ом вместо JSON — сервиса авторизации нет.
  if (
    lower.includes('<!doctype') ||
    lower.includes('is not valid json') ||
    lower.includes('unexpected token') ||
    lower.includes('failed to parse')
  ) {
    return AUTH_UNAVAILABLE
  }

  // Сеть недоступна.
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    return AUTH_NETWORK
  }

  // База данных не подключена к проекту.
  if (
    lower.includes('not configured') ||
    lower.includes('missing supabase') ||
    lower.includes('__app_config__')
  ) {
    return AUTH_NOT_CONFIGURED
  }

  // Осмысленный ответ сервера — отдаём как есть.
  return text
}

function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user) return null
  return { id: user.id, email: user.email ?? null }
}

/* ВОССТАНОВЛЕНО: середина файла (signUp/signIn/signOut/resetPassword) была
   обрезана при копировании. Тексты ошибок и контракт хука — дословно. */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const errorRef = useRef<string | null>(null)

  const rememberError = useCallback((message: string | null) => {
    errorRef.current = message
    setError(message)
  }, [])

  const lastError = useCallback(() => errorRef.current, [])
  const clearError = useCallback(() => rememberError(null), [rememberError])

  useEffect(() => {
    const supabase = getSupabase()

    if (!supabase) {
      rememberError(AUTH_NOT_CONFIGURED)
      setLoading(false)
      return
    }

    let active = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setUser(toAuthUser(data.session?.user))
      })
      .catch(() => {
        if (active) rememberError(AUTH_UNAVAILABLE)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session?.user))
    })

    return () => {
      active = false
      subscription?.subscription?.unsubscribe()
    }
  }, [rememberError])

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string): Promise<boolean> => {
      const supabase = getSupabase()
      if (!supabase) {
        rememberError(AUTH_NOT_CONFIGURED)
        return false
      }

      setLoading(true)
      rememberError(null)

      try {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: displayName ? { data: { display_name: displayName } } : undefined,
        })

        if (authError) {
          rememberError(authErrorMessage(authError, SIGN_UP_FAILED))
          return false
        }

        setUser(toAuthUser(data.user))
        return true
      } catch (err) {
        rememberError(authErrorMessage(err, SIGN_UP_FAILED))
        return false
      } finally {
        setLoading(false)
      }
    },
    [rememberError]
  )

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const supabase = getSupabase()
      if (!supabase) {
        rememberError(AUTH_NOT_CONFIGURED)
        return false
      }

      setLoading(true)
      rememberError(null)

      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          rememberError(authErrorMessage(authError, SIGN_IN_FAILED))
          return false
        }

        setUser(toAuthUser(data.user))
        return true
      } catch (err) {
        rememberError(authErrorMessage(err, SIGN_IN_FAILED))
        return false
      } finally {
        setLoading(false)
      }
    },
    [rememberError]
  )

  const signOut = useCallback(async (): Promise<boolean> => {
    const supabase = getSupabase()
    if (!supabase) {
      rememberError(AUTH_NOT_CONFIGURED)
      return false
    }

    setLoading(true)
    rememberError(null)

    try {
      const { error: authError } = await supabase.auth.signOut()
      if (authError) {
        rememberError(authErrorMessage(authError, SIGN_OUT_FAILED))
        return false
      }
      setUser(null)
      return true
    } catch (err) {
      rememberError(authErrorMessage(err, SIGN_OUT_FAILED))
      return false
    } finally {
      setLoading(false)
    }
  }, [rememberError])

  const resetPassword = useCallback(
    async (email: string): Promise<boolean> => {
      const supabase = getSupabase()
      if (!supabase) {
        rememberError(AUTH_NOT_CONFIGURED)
        return false
      }

      setLoading(true)
      rememberError(null)

      try {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email)
        if (authError) {
          rememberError(authErrorMessage(authError, RESET_FAILED))
          return false
        }
        return true
      } catch (err) {
        rememberError(authErrorMessage(err, RESET_FAILED))
        return false
      } finally {
        setLoading(false)
      }
    },
    [rememberError]
  )

  return {
    user,
    loading,
    error,
    lastError,
    isAuthenticated: user !== null,
    signUp,
    signIn,
    signOut,
    resetPassword,
    clearError,
  }
}