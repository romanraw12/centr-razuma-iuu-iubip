/* ВОССТАНОВЛЕНО по контракту из AdamAssistant.tsx и design-system.json:
   Николь (ковёр-самолёт) — туризм, Адам (рыцарь) — юриспруденция,
   Кейн (чародей с колпаком и флаконом) — фармация, Бани (эльф) — экономика. */

export type CharacterId = 'adam' | 'nicole' | 'cain' | 'bani'

export type CategoryId = 'tourism' | 'law' | 'economics' | 'pharmacy'

export interface Character {
  id: CharacterId
  name: string
  categoryId: CategoryId
  /** Роль в двух словах: показывается рядом с именем. */
  role: string
  /** Реплика приветствия в панели героев. */
  greeting: string
  /** Эмодзи-иконка раздела (обложки книг делаются на primary-фоне). */
  emoji: string
}

export const CHARACTERS: Character[] = [
  {
    id: 'adam',
    name: 'Адам',
    categoryId: 'law',
    role: 'рыцарь права',
    greeting:
      'Приветствую! Я Адам, рыцарь Центра разума. Разберём юриспруденцию по шагам — от теории государства до отраслей права.',
    emoji: '⚖️',
  },
  {
    id: 'nicole',
    name: 'Николь',
    categoryId: 'tourism',
    role: 'проводник по туризму',
    greeting:
      'Здравствуйте! Я Николь. Покажу, как устроена индустрия гостеприимства — от средств размещения до сервиса.',
    emoji: '🧭',
  },
  {
    id: 'cain',
    name: 'Кейн',
    categoryId: 'pharmacy',
    role: 'магистр фармации',
    greeting:
      'Приветствую! Я Кейн. Расскажу про фармацию и сестринское дело: препараты, рецепты, уход за пациентом.',
    emoji: '⚗️',
  },
  {
    id: 'bani',
    name: 'Бани',
    categoryId: 'economics',
    role: 'хранитель экономики',
    greeting:
      'Здравствуйте! Я Бани. Объясню экономику и управление: спрос, издержки, финансы организации.',
    emoji: '📈',
  },
]

export function getCharacterByCategory(categoryId: string): Character | undefined {
  return CHARACTERS.find((character) => character.categoryId === categoryId)
}

export function getCharacterById(id: CharacterId): Character | undefined {
  return CHARACTERS.find((character) => character.id === id)
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
    description: 'Средства размещения, турпродукт, качество сервиса, экономика отрасли.',
    emoji: '🧭',
    characterId: 'nicole',
  },
  {
    id: 'law',
    title: 'Юриспруденция',
    description: 'Теория государства и права, конституционное, гражданское и трудовое право.',
    emoji: '⚖️',
    characterId: 'adam',
  },
  {
    id: 'economics',
    title: 'Экономика и управление',
    description: 'Микро- и макроэкономика, менеджмент, финансы организации, маркетинг.',
    emoji: '📈',
    characterId: 'bani',
  },
  {
    id: 'pharmacy',
    title: 'Фармация и сестринское дело',
    description: 'Фармакология, технология лекарств, сестринский уход, медицинская этика.',
    emoji: '⚗️',
    characterId: 'cain',
  },
]