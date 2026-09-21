/* Данные героев из боевой сборки Wuna (массив Sf): Николь (ковёр-самолёт) —
   туризм, Адам (рыцарь) — юриспруденция, Кейн (чародей с колпаком и флаконом) —
   фармация, Бани (эльф) — экономика. Идентификатор Бани в оригинале — 'bunny'. */

import { CHARACTER_EXTRAS } from './characterExtras'

export type CharacterId = 'adam' | 'nicole' | 'cain' | 'bunny'

export type CategoryId = 'tourism' | 'law' | 'economics' | 'pharmacy'

export interface Character {
  id: CharacterId
  name: string
  categoryId: CategoryId
  /** Роль из оригинала: «Рыцарь юриспруденции», «Чародей фармации»… */
  role: string
  /** Короткая подпись героя из оригинала (поле tagline). */
  tagline: string
  /** Реплика приветствия в панели героев. */
  greeting: string
  /** Эмодзи-иконка раздела (обложки книг делаются на primary-фоне). */
  emoji: string
  /** Реплики героя о конкретных изданиях раздела (ключ — id книги). */
  bookLines: Record<string, string>
  /** Вердикт теста при отличном результате. */
  greatDone: string
  /** Заголовок вердикта при среднем результате. */
  midDoneTitle: string
  /** Текст вердикта при среднем результате. */
  midDoneText: string
}

/* Данные героев — из боевой сборки Wuna (массив Sf в dump/js-strings.txt):
   имена, роли, tagline и приветствия перенесены дословно. */
const CHARACTER_BASE: Omit<
  Character,
  'bookLines' | 'greatDone' | 'midDoneTitle' | 'midDoneText'
>[] = [
  {
    id: 'adam',
    name: 'Адам',
    categoryId: 'law',
    role: 'Рыцарь юриспруденции',
    tagline: 'Парень в рыцарских доспехах, охраняющий зал правовых наук',
    greeting:
      'Приветствую! Я Адам, рыцарь Центра разума. Юриспруденция — мой родной зал: теория государства и права, гражданское, трудовое и конституционное право. Объясню по пунктам — читать талмуды не обязательно!',
    emoji: '⚖️',
  },
  {
    id: 'nicole',
    name: 'Николь',
    categoryId: 'tourism',
    role: 'Проводница туризма',
    tagline: 'Девушка на ковре-самолёте, знающая все маршруты гостеприимства',
    greeting:
      'Привет! Я Николь, проводница туризма и гостеприимства. Мой ковёр-самолёт готов: отели, сервис, туроперейтинг и внутренний туризм — объясню так, что читать не захочется, а захочется лететь!',
    emoji: '✈️',
  },
  {
    id: 'cain',
    name: 'Кейн',
    categoryId: 'pharmacy',
    role: 'Чародей фармации',
    tagline: 'Мужчина-чародей, хранящий рецепты здоровья',
    greeting:
      'Здравствуй! Я Кейн, чародей фармации и сестринского дела. Лекарства, рецептура, фармацевтическая химия и уход за пациентами — мои заклинания. Объясню по шагам, и никакая фармакология не будет страшной!',
    emoji: '⚕️',
  },
  {
    id: 'bunny',
    name: 'Бани',
    categoryId: 'economics',
    role: 'Эльф экономики',
    tagline: 'Эльф, чьё остроухое чутьё безошибочно чует выгоду',
    greeting:
      'Привет! Я Бани, эльф экономики и управления. Спрос и предложение, менеджмент, маркетинг и финансы — мой лес, и я проведу тебя по тропам дисциплины ловко и быстро!',
    emoji: '📈',
  },
]

/* Реплики к изданиям и вердикты тестов берём из отдельного модуля, который
   генерируется из боевого бандла (src/lib/characterExtras.ts). */
export const CHARACTERS: Character[] = CHARACTER_BASE.map((character) => {
  const extras = CHARACTER_EXTRAS[character.categoryId]
  return {
    ...character,
    bookLines: extras?.bookLines ?? {},
    greatDone: extras?.greatDone ?? '',
    midDoneTitle: extras?.midDoneTitle ?? '',
    midDoneText: extras?.midDoneText ?? '',
  }
})

export function getCharacterByCategory(categoryId: string): Character | undefined {
  return CHARACTERS.find((character) => character.categoryId === categoryId)
}

export function getCharacterById(id: CharacterId): Character | undefined {
  return CHARACTERS.find((character) => character.id === id)
}

/** Реплика героя раздела о конкретном издании — для карточки книги. */
export function getHeroBookLine(
  categoryId: string,
  bookId: number | string
): string | undefined {
  const character = getCharacterByCategory(categoryId)
  return character?.bookLines[String(bookId)]
}

export interface Category {
  id: CategoryId
  title: string
  /** Короткое описание для карточки раздела. */
  description: string
  emoji: string
  characterId: CharacterId
}

export const CATEGORIES: Category[] = [
  {
    id: 'tourism',
    title: 'Туризм и гостеприимство',
    description: 'Индустрия гостеприимства, гостиничный бизнес, туроперейтинг и сервис.',
    emoji: '✈️',
    characterId: 'nicole',
  },
  {
    id: 'law',
    title: 'Юриспруденция',
    description: 'Теория государства и права, гражданское, уголовное и трудовое право.',
    emoji: '⚖️',
    characterId: 'adam',
  },
  {
    id: 'economics',
    title: 'Экономика и управление',
    description: 'Микро- и макроэкономика, менеджмент, маркетинг и финансы.',
    emoji: '📈',
    characterId: 'bunny',
  },
  {
    id: 'pharmacy',
    title: 'Фармация и сестринское дело',
    description: 'Фармакология, фармацевтическая химия и основы сестринского ухода.',
    emoji: '⚕️',
    characterId: 'cain',
  },
]