import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ChevronRight, ChevronLeft, X, Swords, BookOpen, Sparkles, ListChecks, Volume2, VolumeX, AudioLines } from 'lucide-react';
import { playSfx, playVoice, speakHero, stopSpeaking, toggleSound, toggleVoice, isSoundEnabled, isVoiceEnabled, unlockSpeech } from '../lib/heroSounds';
import { ADAM_GREETING, getAdamKnowledge } from '../lib/adamKnowledge';
import { SAMPLE_BOOKS } from '../lib/libraryData';
import { Link } from 'react-router-dom';
import { CHARACTERS, getCharacterByCategory, type CharacterId } from '../lib/characters';
import CharacterAvatar from './CharacterAvatar';
import CharacterQuiz from './CharacterQuiz';

/* ============================================================
   Герои-ассистенты «Центра разума».
   Адам (юрист), Николь (туризм), Кейн (фармация), Бани (экономика).
   Каждый пошагово объясняет свой раздел и проводит тест
   с разбором ошибок. Панель открывается плавающей кнопкой.
   ============================================================ */

/** Анимированная фигурка рыцаря Адама (SVG) */
export function AdamKnight({ size = 56, talking = false, plain = false }: {
  size?: number;
  talking?: boolean;
  plain?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label="Рыцарь Адам"
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden ${
        talking ? 'animate-adam-bounce' : 'animate-adam-float'
      }`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="adam-knight">
        <circle cx="50" cy="50" r="50" className="adam-bg" />
        <path d="M50 6 C 62 12, 70 24, 66 34 L 34 34 C 30 24, 38 12, 50 6 Z" className="adam-plume" />
        <path d="M30 52 C 30 30, 40 22, 50 22 C 60 22, 70 30, 70 52 L 70 66 C 70 72, 62 76, 50 76 C 38 76, 30 72, 30 66 Z" className="adam-helmet" />
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
      {!plain && <span aria-hidden="true" className="absolute inset-0 rounded-full animate-adam-glow" />}
    </span>
  );
}

/** Реплика с эффектом печатной машинки */
function HeroSpeech({ text, speed = 18, voice }: { text: string; speed?: number; voice?: CharacterId }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    playVoice(voice);
    speakHero(text, voice);
    if (!text) return;
    const id = setInterval(() => {
      setShown((prev) => (prev >= text.length ? (clearInterval(id), prev) : prev + 2));
    }, speed);
    return () => {
      clearInterval(id);
      stopSpeaking();
    };
  }, [text, speed, voice]);
  return (
    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
      {text.slice(0, shown)}
      <span className="adam-caret" aria-hidden="true">▍</span>
    </p>
  );
}

/** Плавающая кнопка вызова героев — видна на всех страницах */
export function AdamLauncher({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="adam-launcher fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
    >
      <AdamKnight size={28} plain />
      <span className="text-sm font-medium text-foreground">Спросить Адама</span>
    </button>
  );
}

/** Панель героя: вкладки «Объяснение» и «Тест». */
export function AdamPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'explain' | 'quiz'>('explain');
  const [activeId, setActiveId] = useState<CharacterId>('adam');
  const [step, setStep] = useState(0);
  const [sound, setSound] = useState(isSoundEnabled());
  const [voice, setVoice] = useState(isVoiceEnabled());

  const character = CHARACTERS.find((item) => item.id === activeId) ?? CHARACTERS[0];
  const knowledge = getAdamKnowledge(character.categoryId);
  const steps = knowledge.steps;
  const book = SAMPLE_BOOKS.find((item) => item.categoryId === character.categoryId);

  const atStart = step === 0;
  const atEnd = step >= steps.length;
  const speech = atStart
    ? character.id === 'adam'
      ? ADAM_GREETING
      : `${character.greeting}\n\n${knowledge.intro}`
    : atEnd
      ? `${steps[steps.length - 1].text}\n\n${knowledge.outro}`
      : `${steps[step - 1].title}.\n\n${steps[step - 1].text}`;

  const selectCharacter = (id: CharacterId) => {
    playSfx('click');
    setActiveId(id);
    setStep(0);
    setTab('explain');
  };

  return (
    <aside
      role="dialog"
      aria-label="Герои-ассистенты"
      className="fixed bottom-24 right-5 z-50 flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-2xl"
    >
      <header className="flex items-start gap-3">
        <AdamKnight size={40} talking={tab === 'explain'} plain={character.id !== 'adam'} />
        <div className="flex-1">
          <p className="font-semibold text-foreground">{character.name}</p>
          <p className="text-xs text-muted-foreground">{character.role}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть панель"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {CHARACTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectCharacter(item.id)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
              item.id === character.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-accent'
            }`}
          >
            <span aria-hidden="true">{item.emoji}</span>
            {item.name}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => {
            playSfx('click');
            setTab('explain');
          }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === 'explain' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Объяснение
        </button>
        <button
          type="button"
          onClick={() => {
            playSfx('click');
            setTab('quiz');
          }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === 'quiz' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <ListChecks className="h-3.5 w-3.5" />
          Тест
        </button>
      </div>

      {tab === 'explain' ? (
        <div className="space-y-3">
          <div className="max-h-64 overflow-y-auto pr-1">
            <HeroSpeech text={speech} voice={character.id} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Swords className="h-3.5 w-3.5" />
              Шаг {Math.min(step, steps.length)} из {steps.length}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {character.categoryId}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={atStart}
              onClick={() => {
                playSfx('click');
                setStep((value) => Math.max(0, value - 1));
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </Button>
            <Button
              size="sm"
              disabled={atEnd}
              onClick={() => {
                playSfx('open');
                setStep((value) => Math.min(steps.length, value + 1));
              }}
            >
              Дальше
              <ChevronRight className="h-4 w-4" />
            </Button>
            {atEnd && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  playSfx('click');
                  setStep(0);
                }}
              >
                <Sparkles className="h-4 w-4" />
                Ещё раз
              </Button>
            )}
          </div>

          {atEnd && book && (
            <Link
              to={`/book/${book.id}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm transition-colors hover:bg-accent"
            >
              <span aria-hidden="true">{book.cover}</span>
              <span className="flex-1 text-foreground">{book.title}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}

          {atEnd && <p className="text-xs text-muted-foreground">{knowledge.bookTip}</p>}
        </div>
      ) : (
        <CharacterQuiz categoryId={character.categoryId} />
      )}

      <footer className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSound(toggleSound())}
            title={sound ? 'Выключить звук' : 'Включить звук'}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="sr-only">Настроить громкость</span>
          </button>
          <button
            type="button"
            onClick={() => setVoice(toggleVoice())}
            title={voice ? 'Выключить голос' : 'Включить голос'}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <AudioLines className="h-4 w-4" />
            <span className="sr-only">Регулировка скорости речи</span>
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {sound ? 'Звук включён' : 'Звук выключен'} · {voice ? 'голос включён' : 'голос выключен'}
        </p>
      </footer>
    </aside>
  );
}

/** Плавающая кнопка + панель: ставится один раз в App. */
export function AdamAssistant() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    unlockSpeech();
  }, [open]);

  return open ? (
    <AdamPanel onClose={() => setOpen(false)} />
  ) : (
    <AdamLauncher
      onOpen={() => {
        unlockSpeech();
        playSfx('open');
        setOpen(true);
      }}
    />
  );
}

export default AdamAssistant;