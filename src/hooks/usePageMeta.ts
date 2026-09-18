import { useEffect } from 'react'

/* ВОССТАНОВЛЕНО: файл восстановлен по поведению из бандла index-*.js.
   Логика дословная: берём siteName из __APP_CONFIG__, не дублируем название
   сайта, если оно уже в заголовке, проставляем og:/twitter: мета. */

const SEPARATOR = ' — '

const HOME_TITLES = [
  'главная',
  'главная страница',
  'домашняя страница',
  'начало',
  'home',
  'home page',
  'homepage',
  'index',
  'main',
  'start',
]

const WORD_CHAR = /[0-9A-Za-zµÀ-ɏ-Ͽ-ԯ]/

function tidy(value: string): string {
  return value.replace(/[\s​‌﻿]+/g, ' ').trim()
}

function lower(value: string): string {
  return tidy(value).toLowerCase()
}

function siteName(): string {
  if (typeof window === 'undefined') return ''
  const config = window.__APP_CONFIG__
  return typeof config?.siteName === 'string' ? tidy(config.siteName) : ''
}

/** Короткое имя бренда: «Центр разума ЮУ ИУБиП» без хвоста после разделителя. */
function brandName(): string {
  const name = siteName()
  const separators = [SEPARATOR, ' – ', ' - ', ' | ', ' · ', ' • ', ': ']
  let cut = -1
  for (const sep of separators) {
    const at = name.indexOf(sep)
    if (at > 0 && (cut < 0 || at < cut)) cut = at
  }
  if (cut < 0) return name
  const head = name.slice(0, cut).trim()
  return head.length >= 3 ? head : name
}

function containsBrand(title: string): boolean {
  const text = lower(title)
  const brand = lower(brandName())
  if (!brand) return false

  let from = 0
  while (from <= text.length - brand.length) {
    const at = text.indexOf(brand, from)
    if (at < 0) return false
    const before = at > 0 ? text.charAt(at - 1) : ''
    const after = text.charAt(at + brand.length)
    if (!WORD_CHAR.test(before) && !WORD_CHAR.test(after)) return true
    from = at + 1
  }
  return false
}

function fullTitle(title?: string): string {
  const prepared = tidy(title || '')
  const name = siteName()
  if (!name) return prepared
  if (!prepared || lower(prepared) === lower(name) || HOME_TITLES.includes(lower(prepared))) {
    return name
  }
  return containsBrand(prepared) ? prepared : prepared + SEPARATOR + name
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let tag = document.head.querySelector<HTMLMetaElement>(selector)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

export interface PageMetaOptions {
  title?: string
  description?: string
  image?: string
}

export function usePageMeta({ title, description, image }: PageMetaOptions) {
  useEffect(() => {
    const resolved = fullTitle(title)
    if (resolved) {
      document.title = resolved
      setMeta('property', 'og:title', resolved)
      setMeta('name', 'twitter:title', resolved)
    }
    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
    }
    if (image) setMeta('property', 'og:image', image)
    setMeta('property', 'og:type', 'website')
  }, [title, description, image])
}