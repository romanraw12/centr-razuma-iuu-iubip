import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/* ВОССТАНОВЛЕНО: начало файла было обрезано при копировании.
   Тело эффекта (watch/tryScroll/abort) — дословно из исходного кода. */

/**
 * Прокрутка при навигации.
 *
 * Якорь (#id) — прокручиваем к элементу с учётом html { scroll-padding-top }.
 * Переход по ссылке (PUSH/REPLACE) без якоря — вверх страницы.
 * Возврат назад (POP) не трогаем: браузер сам восстанавливает позицию.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  // navigationType не входит в Location в react-router v6 — берём отдельным хуком
  const navigationType = useNavigationType()

  useEffect(() => {
    if (!hash) return

    const id = decodeURIComponent(hash.slice(1))
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let rafId = 0
    let findAttempts = 0
    let watchFrames = 0
    let stableFrames = 0
    let scrollCalls = 0
    let lastTop: number | null = null
    let aborted = false

    // Пользователь начал листать сам — больше не вмешиваемся.
    const abort = () => { aborted = true }
    const abortEvents: Array<keyof WindowEventMap> = ['wheel', 'touchstart', 'mousedown', 'keydown']
    abortEvents.forEach((ev) => window.addEventListener(ev, abort, { passive: true }))

    const targetOffset = () => {
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
      return Number.isFinite(pad) ? pad : 0
    }

    const doScroll = (el: Element) => {
      scrollCalls += 1
      el.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start',
      })
    }

    // После первого вызова следим ~4 секунды: если прокрутка замерла не у
    // цели (её отменил чужой вызов), повторяем scrollIntoView (не более 3 раз).
    const watch = (el: Element) => {
      if (aborted) return
      watchFrames += 1
      if (watchFrames > 240) return
      const top = el.getBoundingClientRect().top
      if (Math.abs(top - targetOffset()) <= 4) return
      if (lastTop !== null && Math.abs(top - lastTop) < 0.5) {
        stableFrames += 1
        if (stableFrames >= 8) {
          if (scrollCalls >= 3) return
          stableFrames = 0
          doScroll(el)
        }
      } else {
        stableFrames = 0
      }
      lastTop = top
      rafId = window.requestAnimationFrame(() => watch(el))
    }

    const tryScroll = () => {
      if (aborted) return
      const el = document.getElementById(id)
      if (el) {
        doScroll(el)
        rafId = window.requestAnimationFrame(() => watch(el))
        return
      }
      findAttempts += 1
      if (findAttempts < 120) {
        rafId = window.requestAnimationFrame(tryScroll)
      }
    }

    rafId = window.requestAnimationFrame(tryScroll)
    return () => {
      window.cancelAnimationFrame(rafId)
      abortEvents.forEach((ev) => window.removeEventListener(ev, abort))
    }
  }, [pathname, hash])

  useEffect(() => {
    if (hash) return
    if (navigationType === 'POP') return

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash, navigationType])

  return null
}