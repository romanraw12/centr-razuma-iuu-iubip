import { CHARACTERS, type CharacterId, type CategoryId } from '@/lib/characters'

/* ВОССТАНОВЛЕНО: файл не дошёл в дампе. По design-system.json у каждого героя
   своя SVG-фигура и свой набор классов (adam-knight, chr-carpet, chr-hat /
   chr-flask, chr-ear) — здесь фигуры ещё не нарисованы, показан знак
   направления на токенах темы. Заменить оригинальными SVG из вкладки «Код». */

const FIGURE_CLASS: Record<CharacterId, string> = {
  adam: 'adam-knight',
  nicole: 'chr-carpet',
  cain: 'chr-hat chr-flask',
  bani: 'chr-ear',
}

export function CharacterAvatar({
  id,
  size = 48,
  talking = false,
}: {
  id: CharacterId
  size?: number
  talking?: boolean
}) {
  const character = CHARACTERS.find((item) => item.id === id) ?? CHARACTERS[0]

  return (
    <span
      role="img"
      aria-label={character.name}
      title={`${character.name} — ${character.role}`}
      className={`${FIGURE_CLASS[character.id]} relative inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ${
        talking ? 'animate-adam-bounce' : 'animate-adam-float'
      }`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      <span aria-hidden="true">{character.emoji}</span>
    </span>
  )
}

export function CharacterBadge({ categoryId }: { categoryId: CategoryId | string }) {
  const character = CHARACTERS.find((item) => item.categoryId === categoryId)
  if (!character) return null

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
      <span aria-hidden="true">{character.emoji}</span>
      {character.name}
    </span>
  )
}

export default CharacterAvatar