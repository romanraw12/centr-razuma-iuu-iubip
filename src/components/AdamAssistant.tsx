import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ChevronRight, ChevronLeft, X, Swords, BookOpen, Sparkles, ListChecks, Volume2, VolumeX, AudioLines } from 'lucide-react';
import { playSfx, playVoice, speakHero, stopSpeaking, toggleSound, toggleVoice, isSoundEnabled, isVoiceEnabled, unlockSpeech } from '../lib/heroSounds';
import { ADAM_GREETING, getAdamKnowledge } from '../lib/adamKnowledge';
import { SAMPLE_BOOKS } from '../lib/libraryData';
import { Link } from 'react-router-dom';
import { CHARACTERS, getCharacterByCategory, type CharacterId } from '../lib/characters';
import CharacterAvatar, { AdamFigure } from './CharacterAvatar';
import CharacterQuiz from './CharacterQuiz';

/* ============================================================
   Герои-ассистенты «Центра разума».
   Адам (юрист), Николь (туризм), Кейн (фармация), Бани (экономика).
   Каждый пошагово объясняет свой раздел и проводит тест
   с разбором ошибок. Панель открывается плавающей кнопкой.
   ============================================================ */

/* Фигуры героев — в CharacterAvatar.tsx: разметка и классы перенесены
   из боевой сборки Wuna (adam-knight, chr-carpet, chr-hat/chr-flask, chr-ear). */

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
      <AdamFigure size={28} plain />
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
        <CharacterAvatar id={character.id} size={44} talking={tab === 'explain'} />
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