import { CHARACTERS, type CharacterId, type CategoryId } from '@/lib/characters'

/* Фигуры героев перенесены дословно из боевой сборки Wuna: SVG-разметка,
   атрибуты и классы (adam-*, chr-*) совпадают с оригиналом один к одному.
   Компоненты названы как в бандле: Sc — Адам, SC — Николь, _C — Кейн,
   kC — Бани, Er — универсальный переключатель (CharacterAvatar). */

interface FigureProps {
  size?: number
  talking?: boolean
}

const WRAP = 'relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden'
const anim = (talking: boolean) => (talking ? 'animate-adam-bounce' : 'animate-adam-float')
const Glow = () => (
  <span aria-hidden="true" className="absolute inset-0 rounded-full animate-adam-glow" />
)

export function AdamFigure({
  size = 56,
  talking = false,
  plain = false,
}: FigureProps & { plain?: boolean }) {
  return (
    <span
      role="img"
      aria-label="Рыцарь Адам"
      className={`${WRAP} ${anim(talking)}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="adam-knight">
        <circle cx="50" cy="50" r="50" className="adam-bg" />
        <path d="M50 6 C 62 12, 70 24, 66 34 L 34 34 C 30 24, 38 12, 50 6 Z" className="adam-plume" />
        <path
          d="M30 52 C 30 30, 40 22, 50 22 C 60 22, 70 30, 70 52 L 70 66 C 70 72, 62 76, 50 76 C 38 76, 30 72, 30 66 Z"
          className="adam-helmet"
        />
        <rect x="36" y="44" width="28" height="5" rx="2.5" className="adam-visor" />
        <circle cx="43" cy="56" r="2.6" className="adam-eye" />
        <circle cx="57" cy="56" r="2.6" className="adam-eye" />
        <circle cx="38" cy="36" r="1.4" className="adam-rivet" />
        <circle cx="62" cy="36" r="1.4" className="adam-rivet" />
        <circle cx="50" cy="30" r="1.4" className="adam-rivet" />
        <path d="M22 78 C 24 68, 34 64, 40 68 L 40 82 C 32 84, 24 84, 22 78 Z" className="adam-armor" />
        <path d="M78 78 C 76 68, 66 64, 60 68 L 60 82 C 68 84, 76 84, 78 78 Z" className="adam-armor" />
        <path d="M34 78 C 38 70, 62 70, 66 78 L 64 92 C 56 96, 44 96, 36 92 Z" className="adam-armor" />
        <path d="M44 80 h12 M44 85 h12 M44 90 h8" className="adam-book" />
      </svg>
      {!plain && <Glow />}
    </span>
  )
}

export function NicoleFigure({ size = 56, talking = false }: FigureProps) {
  return (
    <span
      role="img"
      aria-label="Николь на ковре-самолёте"
      className={`${WRAP} ${anim(talking)}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="chr-svg">
        <circle cx="50" cy="50" r="50" className="chr-bg" />
        <path d="M14 70 C 26 62, 74 62, 86 70 C 74 80, 26 80, 14 70 Z" className="chr-carpet" />
        <path d="M24 70 h52" className="chr-carpet-line" />
        <path d="M30 66 l4 4 M44 65 l5 5 M60 65 l5 5" className="chr-carpet-line" />
        <path d="M36 26 C 38 16, 62 16, 64 26 L 66 44 C 60 34, 40 34, 34 44 Z" className="chr-hair" />
        <circle cx="50" cy="38" r="12" className="chr-face" />
        <circle cx="45" cy="37" r="1.8" className="chr-eye" />
        <circle cx="55" cy="37" r="1.8" className="chr-eye" />
        <path d="M46 43 Q 50 46, 54 43" className="chr-smile" />
        <path d="M40 24 L 44 18 L 50 23 L 56 18 L 60 24 Z" className="chr-crown" />
        <path d="M36 50 L 26 58 M64 50 L 74 58" className="chr-limb" />
      </svg>
      <Glow />
    </span>
  )
}

export function CainFigure({ size = 56, talking = false }: FigureProps) {
  return (
    <span
      role="img"
      aria-label="Чародей Кейн"
      className={`${WRAP} ${anim(talking)}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="chr-svg">
        <circle cx="50" cy="50" r="50" className="chr-bg" />
        <path d="M50 4 L 64 34 L 36 34 Z" className="chr-hat" />
        <circle cx="50" cy="9" r="3" className="chr-star" />
        <circle cx="50" cy="44" r="13" className="chr-face" />
        <circle cx="45" cy="42" r="1.8" className="chr-eye" />
        <circle cx="55" cy="42" r="1.8" className="chr-eye" />
        <path d="M40 50 C 42 66, 58 66, 60 50 C 56 56, 44 56, 40 50 Z" className="chr-beard" />
        <path d="M32 58 C 34 66, 40 70, 50 70 C 60 70, 66 66, 68 58 L 66 86 C 56 92, 44 92, 34 86 Z" className="chr-robe" />
        <path d="M72 62 h8 v6 l3 8 h-14 l3 -8 Z" className="chr-flask" />
        <circle cx="76" cy="74" r="1.2" className="chr-star" />
        <circle cx="73" cy="76" r="0.8" className="chr-star" />
      </svg>
      <Glow />
    </span>
  )
}

export function BunnyFigure({ size = 56, talking = false }: FigureProps) {
  return (
    <span
      role="img"
      aria-label="Эльф Бани"
      className={`${WRAP} ${anim(talking)}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="chr-svg">
        <circle cx="50" cy="50" r="50" className="chr-bg" />
        <path d="M36 40 C 26 30, 22 20, 24 12 C 32 16, 38 24, 40 34 Z" className="chr-ear" />
        <path d="M64 40 C 74 30, 78 20, 76 12 C 68 16, 62 24, 60 34 Z" className="chr-ear" />
        <circle cx="50" cy="44" r="14" className="chr-face" />
        <path
          d="M36 38 C 34 54, 36 70, 34 82 C 40 76, 42 70, 42 64 C 44 74, 56 74, 58 64 C 58 70, 60 76, 66 82 C 64 70, 66 54, 64 38 C 60 30, 40 30, 36 38 Z"
          className="chr-hair"
        />
        <circle cx="45" cy="42" r="1.8" className="chr-eye" />
        <circle cx="55" cy="42" r="1.8" className="chr-eye" />
        <path d="M46 49 Q 50 52, 54 49" className="chr-smile" />
        <path d="M68 30 C 74 26, 80 28, 82 34 C 76 38, 70 36, 68 30 Z" className="chr-leaf" />
        <path d="M36 58 C 40 68, 60 68, 64 58 L 62 84 C 54 90, 46 90, 38 84 Z" className="chr-robe" />
      </svg>
      <Glow />
    </span>
  )
}



export function CharacterAvatar({
  id,
  size = 56,
  talking = false,
}: {
  id: CharacterId
  size?: number
  talking?: boolean
}) {
  switch (id) {
    case 'nicole':
      return <NicoleFigure size={size} talking={talking} />
    case 'cain':
      return <CainFigure size={size} talking={talking} />
    case 'bunny':
      return <BunnyFigure size={size} talking={talking} />
    default:
      return <AdamFigure size={size} talking={talking} />
  }
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