import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { getCharacterByCategory, type CharacterId } from '@/lib/characters'
import { playSfx, speakHero, stopSpeaking } from '@/lib/heroSounds'
import { QUIZ_BANKS } from '@/lib/quizBanks'
import CharacterAvatar from './CharacterAvatar'

/* Вопросы, разборы и вердикты берутся из src/lib/quizBanks.ts — модуля,
   сгенерированного из боевой сборки Wuna (по 10 вопросов на раздел).
   Набор ниже остаётся запасным вариантом, если раздела не окажется в сборке.
   Стиль — по design-system.json: pill-варианты ответа, верный —
   border-primary bg-primary/10, неверный выбор — destructive, разбор ошибки
   в рамке, итог с Progress и аватаром. */

export interface QuizQuestion {
  question: string
  options: string[]
  /** Индекс верного варианта. */
  correct: number
  explanation: string
}

const RECONSTRUCTED_QUIZZES: Record<string, QuizQuestion[]> = {
  tourism: [
    {
      question: 'Что гость покупает в первую очередь?',
      options: ['Номер', 'Впечатление и комфорт', 'Обед', 'Экскурсию'],
      correct: 1,
      explanation:
        'Гость платит за впечатление и комфорт: именно поэтому сервис важнее цены, а недовольный гость рассказывает о плохом опыте в среднем девяти знакомым.',
    },
    {
      question: 'Кто из участников — «производитель» турпродукта?',
      options: ['Турагент', 'Туроператор', 'Гид', 'Отель'],
      correct: 1,
      explanation: 'Оператор проектирует и «пакетирует» тур, агент — продаёт готовый продукт. Оператор производитель, агент магазин.',
    },
    {
      question: 'Что означает RevPAR?',
      options: [
        'Средняя цена номера',
        'Загрузка отеля',
        'Выручка на доступный номер',
        'Число отмен брони',
      ],
      correct: 2,
      explanation: 'RevPAR = загрузка (occupancy) × средняя цена (ADR) — выручка на доступный номер.',
    },
  ],
  law: [
    {
      question: 'Какой источник права стоит во главе иерархии в России?',
      options: ['Федеральный закон', 'Конституция', 'Указ Президента', 'Правовой обычай'],
      correct: 1,
      explanation: 'Конституция — высший по юридической силе акт; ни один закон не может ей противоречить.',
    },
    {
      question: 'Что такое юридический факт?',
      options: [
        'Обстоятельство, порождающее правоотношение',
        'Ошибка в договоре',
        'Решение суда',
        'Норма закона',
      ],
      correct: 0,
      explanation: 'Юридический факт — событие или действие, с которым норма права связывает возникновение правоотношения.',
    },
    {
      question: 'Какой принцип означает, что вина не предполагается?',
      options: ['Законность', 'Презумпция невиновности', 'Равенство сторон', 'Диспозитивность'],
      correct: 1,
      explanation: 'Презумпция невиновности: вина доказывается в установленном порядке, а не предполагается.',
    },
  ],
  economics: [
    {
      question: 'Что произойдёт, если цена выше равновесной?',
      options: ['Дефицит', 'Излишек', 'Равновесие', 'Ничего не изменится'],
      correct: 1,
      explanation: 'При цене выше равновесной предложение превышает спрос — образуется излишек товара.',
    },
    {
      question: 'Какие издержки не зависят от объёма выпуска?',
      options: ['Переменные', 'Постоянные', 'Общие', 'Предельные'],
      correct: 1,
      explanation: 'Постоянные издержки — аренда, оклады, амортизация: они не меняются с объёмом.',
    },
    {
      question: 'Какова правильная последовательность функций менеджмента?',
      options: [
        'Контроль → планирование → мотивация',
        'Планирование → организация → мотивация → контроль',
        'Мотивация → контроль → организация',
        'Организация → планирование → контроль',
      ],
      correct: 1,
      explanation: 'Управленческий цикл: планирование, организация, мотивация, контроль.',
    },
  ],
  pharmacy: [
    {
      question: 'Что означает обозначение Rx в рецепте?',
      options: ['Recipe — «возьми»', 'Готово к выдаче', 'Отпускается без рецепта', 'Хранить в холоде'],
      correct: 0,
      explanation: 'Rx — от латинского recipe, «возьми»: с него начинается пропись лекарственной формы.',
    },
    {
      question: 'Какие лекарственные формы относят к мягким?',
      options: ['Таблетки', 'Растворы', 'Мази и суппозитории', 'Порошки'],
      correct: 2,
      explanation: 'Мягкие формы — мази, гели, кремы, суппозитории; твёрдые — таблетки, капсулы, порошки.',
    },
    {
      question: 'Можно ли принять просроченное лекарство, если оно «просто слабее»?',
      options: [
        'Да, если увеличить дозу',
        'Нет, оно может быть опасно',
        'Да, если хранилось в холодильнике',
        'Да, если оно безрецептурное',
      ],
      correct: 1,
      explanation: 'Просроченный препарат не «слабее», а потенциально опасен: продукты распада могут быть токсичны.',
    },
  ],
}

export function CharacterQuiz({
  categoryId,
  onFinish,
}: {
  categoryId: string
  onFinish?: (score: number, total: number) => void
}) {
  const categoryKey = categoryId as keyof typeof QUIZ_BANKS
  const bank = QUIZ_BANKS?.[categoryKey] ?? QUIZ_BANKS?.tourism
  const questions = useMemo(
    () => bank?.questions ?? RECONSTRUCTED_QUIZZES[categoryId] ?? RECONSTRUCTED_QUIZZES.tourism,
    [bank, categoryId]
  )
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState<number[]>([])
  const [finished, setFinished] = useState(false)

  const character = getCharacterByCategory(categoryId)
  const characterId = (character?.id ?? 'adam') as CharacterId
  const current = questions[index]
  const isLast = index === questions.length - 1
  const total = questions.length

  const choose = (option: number) => {
    if (picked !== null) return
    setPicked(option)
    const correct = option === current.correct
    playSfx(correct ? 'correct' : 'wrong')
    // Герой поясняет ответ своим голосом: за верный — с похвалой,
    // за неверный — мягко, чтобы не отбить желание продолжать.
    speakHero(current.explanation, characterId, correct ? 'praise' : 'support')
    if (correct) setScore((value) => value + 1)
    else setWrong((value) => [...value, index])
  }

  const next = () => {
    if (isLast) {
      setFinished(true)
      onFinish?.(score, total)
      return
    }
    setIndex((value) => value + 1)
    setPicked(null)
  }

  const restart = () => {
    stopSpeaking()
    setIndex(0)
    setPicked(null)
    setScore(0)
    setWrong([])
    setFinished(false)
  }

  // Итог герой произносит своим голосом: одобрительно или поддерживающе.
  useEffect(() => {
    if (!finished) return
    const percent = Math.round((score / total) * 100)
    const passed = percent >= 80
    const verdict = passed
      ? character?.greatDone || 'Отличный результат — раздел можно считать освоенным.'
      : character?.midDoneText || 'Есть над чем поработать: вернись к объяснению и попробуй снова.'
    speakHero(verdict, characterId, passed ? 'praise' : 'support')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  useEffect(() => () => stopSpeaking(), [])

  if (finished) {
    const percent = Math.round((score / total) * 100)
    const passed = percent >= 80
    const character = getCharacterByCategory(categoryId)
    const verdict = passed
      ? character?.greatDone || 'Отличный результат — раздел можно считать освоенным.'
      : character?.midDoneText || 'Есть над чем поработать: вернись к объяснению и попробуй снова.'

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CharacterAvatar id={characterId} size={44} talking />
          <div>
            <p className="font-medium text-foreground">
              {passed
                ? `Итог: ${score} из ${total}`
                : `${character?.midDoneTitle || 'Есть пробелы'} · ${score} из ${total}`}
            </p>
            <p className="text-sm text-muted-foreground">{verdict}</p>
          </div>
        </div>
        {wrong.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Повтори темы: {wrong.map((number) => `№${number + 1}`).join(', ')}
          </p>
        )}
        <Progress value={percent} />
        <Button variant="outline" size="sm" onClick={restart}>
          Пройти заново
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Вопрос {index + 1} из {total}
        </span>
        <span>Верно: {score}</span>
      </div>

      {index === 0 && picked === null && bank?.intro && (
        <p className="text-sm text-muted-foreground">{bank.intro}</p>
      )}

      <p className="font-medium text-foreground">{current.question}</p>

      <div className="flex flex-wrap gap-2">
        {current.options.map((option, optionIndex) => {
          const isPicked = picked === optionIndex
          const isCorrect = optionIndex === current.correct
          const showCorrect = picked !== null && isCorrect
          const showWrong = isPicked && !isCorrect

          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(optionIndex)}
              disabled={picked !== null}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                'border-border bg-background text-foreground hover:bg-accent',
                showCorrect && 'border-primary bg-primary/10 text-primary',
                showWrong && 'border-destructive bg-destructive/10 text-destructive'
              )}
            >
              {showCorrect && <CheckCircle2 className="h-4 w-4" />}
              {showWrong && <XCircle className="h-4 w-4" />}
              {option}
            </button>
          )
        })}
      </div>

      {picked !== null && (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {picked === current.correct ? 'Верно. ' : 'Разбор: '}
          </span>
          {current.explanation}
        </div>
      )}

      {picked !== null && (
        <Button size="sm" onClick={next}>
          {isLast ? 'Показать итог' : 'Следующий вопрос'}
        </Button>
      )}
    </div>
  )
}

export default CharacterQuiz