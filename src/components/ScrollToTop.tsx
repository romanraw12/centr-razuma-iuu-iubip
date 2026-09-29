import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/* ВОССТАНОВЛЕНО: начало файла было обрезано при копировании.
   Тело эффекта (watch/tryScroll/abort) — дословно из исходного кода. */

/**
 * Прокрутка при навигации.
 *
 * Якорь (#id) — прокручиваем к элементу с учётом html { scroll-padding-top }.
 * Переход по ссылке (PUSH/REPLACE) без якоря — вверх страницы, но только если
 * сменился путь: правка одной строки запроса (поиск и фильтры каталога делают
 * это через replace) позицию не сбрасывает.
 * Возврат назад (POP) не трогаем: браузер сам восстанавливает позицию.
 * Пока на экране панель героя (html[data-overlay='open']), прокрутку не трогаем
 * вовсе: страница под модальным окном зафиксирована.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  // navigationType не входит в Location в react-router v6 — берём отдельным хуком
  const navigationType = useNavigationType()
  const lastPathname = useRef(pathname)

  /** Панель героя открыта: страницу под ней не трогаем. */
  const overlayOpen = () => document.documentElement.dataset.overlay === 'open'

  useEffect(() => {
    if (!hash) return
    if (overlayOpen()) return

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
    const abortEvents: Array<keyof WindowEventMap> = [
      'wheel',
      'touchstart',
      'touchmove',
      'mousedown',
      'keydown',
    ]
    abortEvents.forEach((ev) => window.addEventListener(ev, abort, { passive: true }))

    const targetOffset = () => {
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
      return Number.isFinite(pad) ? pad : 0
    }

    const doScroll = (el: Element) => {
      if (overlayOpen()) return
      scrollCalls += 1
      el.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start',
      })
    }

    // После первого вызова следим ~4 секунды: если прокрутка замерла не у
    // цели (её отменил чужой вызов), повторяем scrollIntoView (не более 3 раз).
    const watch = (el: Element) => {
      if (aborted || overlayOpen()) return
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
      if (aborted || overlayOpen()) return
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
    const previousPathname = lastPathname.current
    lastPathname.current = pathname

    if (hash) return
    if (navigationType === 'POP') return
    // Поменялась только строка запроса: так работают поиск и фильтры каталога
    // (Home меняет ?q и ?category через replace). Раньше такая замена уводила
    // страницу наверх, и вернуть её на место было уже нечем.
    if (previousPathname === pathname) return

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash, navigationType])

  return null
}