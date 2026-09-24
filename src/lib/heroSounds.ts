import type { CharacterId } from './characters'

/* ВОССТАНОВЛЕНО по списку экспортов из AdamAssistantPanel.tsx:

     playSfx, playVoice, speakHero, stopSpeaking, toggleSound, toggleVoice,
     isSoundEnabled, isVoiceEnabled, unlockSpeech

   Звук героев: короткие эффекты (Web Audio) и речь (Web Speech API). */

const SOUND_KEY = 'cr-sound-enabled'
const VOICE_KEY = 'cr-voice-enabled'

type Listener = () => void

const listeners = new Set<Listener>()

function readFlag(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback
  const stored = window.localStorage.getItem(key)
  if (stored === null) return fallback
  return stored === 'true'
}

function writeFlag(key: string, value: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, String(value))
  listeners.forEach((listener) => listener())
}

export function isSoundEnabled(): boolean {
  return readFlag(SOUND_KEY, true)
}

export function isVoiceEnabled(): boolean {
  return readFlag(VOICE_KEY, true)
}

export function onSoundSettingsChange(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function toggleSound(): boolean {
  const next = !isSoundEnabled()
  writeFlag(SOUND_KEY, next)
  return next
}

export function toggleVoice(): boolean {
  const next = !isVoiceEnabled()
  writeFlag(VOICE_KEY, next)
  if (!next) stopSpeaking()
  return next
}

let audioContext: AudioContext | null = null

/** Браузеры включают звук только после действия пользователя. */
export function unlockSpeech() {
  if (typeof window === 'undefined') return
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    audioContext = audioContext ?? new Ctor()
    if (audioContext.state === 'suspended') void audioContext.resume()
    // Пустая реплика «разогревает» очередь синтеза речи в Safari/Chrome.
    if (isVoiceEnabled() && window.speechSynthesis) {
      const warmUp = new SpeechSynthesisUtterance(' ')
      warmUp.volume = 0
      window.speechSynthesis.speak(warmUp)
    }
  } catch {
    /* звук недоступен — молча продолжаем */
  }
}

const SFX_FREQ: Record<string, number> = {
  click: 520,
  open: 660,
  correct: 780,
  wrong: 300,
}

/** Короткий эффект: одна нота с затуханием. */
export function playSfx(kind: keyof typeof SFX_FREQ | string = 'click') {
  if (!isSoundEnabled()) return
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    audioContext = audioContext ?? new Ctor()
    if (audioContext.state === 'suspended') void audioContext.resume()

    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.frequency.value = SFX_FREQ[kind] ?? SFX_FREQ.click
    oscillator.type = 'sine'
    gain.gain.setValueAtTime(0.08, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.18)
    oscillator.connect(gain).connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch {
    /* звук недоступен */
  }
}

/** Короткий сигнал-«голос» героя перед репликой. */
export function playVoice(character?: CharacterId) {
  if (!character) return
  const kind = character === 'adam' ? 'open' : 'click'
  playSfx(kind)
}

/* ---------------------------------------------------------------------------
   Речь героев.

   Web Speech API не умеет SSML в Chrome и Firefox, поэтому «живость» речи
   набирается приёмами на стороне клиента:

     1) профиль голоса героя — темп, тон, пауза между фразами и список
        предпочтительных системных голосов;
     2) подготовка текста — сокращения раскрываются, пунктуация
        нормализуется, markdown и эмодзи убираются;
     3) реплика озвучивается фразами по очереди с короткой паузой и лёгкой
        вариацией тона: монотонность исчезает, а в Chrome попутно обходится
        лимит на длину одной реплики (около 15 секунд);
     4) настроение (похвала, поддержка, предупреждение) добавляет тёплые или
        серьёзные ноты.
   ------------------------------------------------------------------------- */

export type HeroMood = 'neutral' | 'praise' | 'support' | 'warn'

interface VoiceProfile {
  rate: number
  pitch: number
  volume: number
  /** Пауза между фразами, мс. */
  gap: number
  /** Предпочтительные системные голоса, по убыванию. */
  hints: string[]
}

const VOICE_PROFILES: Record<CharacterId, VoiceProfile> = {
  // Адам — рыцарь-наставник: ровный спокойный голос чуть ниже среднего.
  adam: {
    rate: 0.97,
    pitch: 0.95,
    volume: 1,
    gap: 170,
    hints: [
      'Microsoft Dmitry',
      'Dmitry',
      'Microsoft Pavel',
      'Pavel',
      'Filipp',
      'Yuri',
      'Artemiy',
      'Google русский',
      'Russian',
    ],
  },
  // Николь — хранительница туризма: светлый приветливый голос.
  nicole: {
    rate: 1.02,
    pitch: 1.07,
    volume: 1,
    gap: 140,
    hints: [
      'Microsoft Svetlana',
      'Svetlana',
      'Microsoft Irina',
      'Irina',
      'Milena',
      'Alena',
      'Katya',
      'Dariya',
      'Google русский',
      'Russian',
    ],
  },
  // Кейн — чародей: медленнее, ниже, паузы длиннее — «загадочно».
  cain: {
    rate: 0.9,
    pitch: 0.84,
    volume: 1,
    gap: 230,
    hints: ['Microsoft Dmitry', 'Dmitry', 'Microsoft Pavel', 'Pavel', 'Filipp', 'Google русский', 'Russian'],
  },
  // Бани — эльф: быстрее, выше, паузы короче — «энергично».
  bunny: {
    rate: 1.07,
    pitch: 1.18,
    volume: 1,
    gap: 115,
    hints: [
      'Microsoft Svetlana',
      'Svetlana',
      'Microsoft Irina',
      'Irina',
      'Alena',
      'Katya',
      'Dariya',
      'Milena',
      'Google русский',
      'Russian',
    ],
  },
}

const NEUTRAL_PROFILE: VoiceProfile = { rate: 1, pitch: 1, volume: 1, gap: 150, hints: [] }

/** Поправки к профилю в зависимости от настроения героя. */
const MOOD_TUNING: Record<HeroMood, { rate: number; pitch: number; gap: number }> = {
  neutral: { rate: 0, pitch: 0, gap: 0 },
  praise: { rate: 0.05, pitch: 0.05, gap: -25 },
  support: { rate: -0.04, pitch: -0.02, gap: 60 },
  warn: { rate: -0.02, pitch: -0.04, gap: 40 },
}

const MAX_SPEECH_LENGTH = 1200
const CHUNK_LENGTH = 180

const voiceCache = new Map<CharacterId, SpeechSynthesisVoice | null>()
let voicesListenerAttached = false

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Chrome подгружает голоса асинхронно — ждём событие, но не дольше 600 мс. */
function whenVoicesReady(callback: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const synth = window.speechSynthesis
  if (synth.getVoices().length) {
    callback()
    return
  }

  let done = false
  const run = () => {
    if (done) return
    done = true
    voiceCache.clear()
    callback()
  }

  window.setTimeout(run, 600)

  if (voicesListenerAttached) return
  voicesListenerAttached = true
  try {
    synth.addEventListener('voiceschanged', run, { once: true })
  } catch {
    /* старые движки без addEventListener — хватит таймаута */
  }
}

function pickVoice(character?: CharacterId): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  if (character && voiceCache.has(character)) return voiceCache.get(character) ?? null

  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const profile = character ? VOICE_PROFILES[character] : NEUTRAL_PROFILE
  const russian = voices.filter((voice) => (voice.lang ?? '').toLowerCase().startsWith('ru'))

  let chosen: SpeechSynthesisVoice | null = null
  for (const hint of profile.hints) {
    const needle = hint.toLowerCase()
    chosen =
      russian.find((voice) => voice.name.toLowerCase().includes(needle)) ??
      voices.find((voice) => voice.name.toLowerCase().includes(needle)) ??
      null
    if (chosen) break
  }

  if (!chosen) {
    // Безымянный случай: локальные голоса отзываются быстрее облачных.
    chosen = russian.find((voice) => voice.localService) ?? russian[0] ?? voices[0] ?? null
  }

  if (character) voiceCache.set(character, chosen)
  return chosen
}

/** Лёгкая «дыхательная» вариация: без неё синтез звучит механически. */
function variation(index: number): { rate: number; pitch: number } {
  const wave = Math.sin(index * 1.7)
  return { rate: wave * 0.02, pitch: wave * 0.03 }
}

const ABBREVIATIONS: Array<[RegExp, string]> = [
  [/\bт\.\s*д\./gi, 'так далее'],
  [/\bт\.\s*п\./gi, 'тому подобное'],
  [/\bт\.\s*е\./gi, 'то есть'],
  [/\bнапр\./gi, 'например'],
  [/\bрис\./gi, 'рисунок'],
  [/\bстр\./gi, 'страница'],
  [/\bсм\./gi, 'смотри'],
  [/\bдр\./gi, 'другие'],
  [/\bтыс\./gi, 'тысяч'],
  [/\bруб\./gi, 'рублей'],
]

/** Текст, который звучит живее: без markdown и эмодзи, с раскрытыми сокращениями. */
function humanize(text: string): string {
  let result = text
    .replace(/[*_`#>]+/g, ' ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ' ')
    .replace(/\s*[—–]\s*/g, ' — ')
    .replace(/\s*;\s*/g, '. ')
    .replace(/\s*\.{2,}\s*/g, '… ')
    .replace(/\s+/g, ' ')
    .trim()

  for (const [pattern, replacement] of ABBREVIATIONS) {
    result = result.replace(pattern, replacement)
  }

  // Движки «проглатывают» знаки без пробела после них.
  return result
    .replace(/([.,!?…])(?=[^\s.,!?…])/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Разбиение на фразы: точка внутри числа («1.5») концом фразы не считается. */
function splitSentences(text: string): string[] {
  const sentences: string[] = []
  let buffer = ''

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    buffer += char

    const isEnd = char === '.' || char === '!' || char === '?' || char === '…'
    if (!isEnd) continue

    const next = text[i + 1]
    if (next && !/\s/.test(next)) continue

    sentences.push(buffer.trim())
    buffer = ''
  }

  if (buffer.trim()) sentences.push(buffer.trim())
  return sentences.filter(Boolean)
}

/** Фразы собираются в короткие блоки, длинные предложения делятся по запятым. */
function chunkForSpeech(text: string): string[] {
  const chunks: string[] = []
  let current = ''

  for (const sentence of splitSentences(text)) {
    const parts = sentence.length > CHUNK_LENGTH ? sentence.split(/,\s*/) : [sentence]

    for (const part of parts) {
      const piece = part.trim()
      if (!piece) continue

      const candidate = current ? current + ' ' + piece : piece
      if (candidate.length > CHUNK_LENGTH && current) {
        chunks.push(current)
        current = piece
      } else {
        current = candidate
      }
    }
  }

  if (current) chunks.push(current)
  return chunks
}

let speakToken = 0
let pendingTimer: number | null = null

function resetSpeech() {
  speakToken += 1
  if (pendingTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(pendingTimer)
  }
  pendingTimer = null
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* игнорируем */
  }
}

export interface SpeakOptions {
  character?: CharacterId
  mood?: HeroMood
  /** Множитель темпа поверх профиля героя (регулятор страницы чтения). */
  rateScale?: number
  volume?: number
  /** Вызывается, когда прозвучала последняя фраза. */
  onEnd?: () => void
}

/**
 * Озвучить текст «по-человечески»: фразами, с паузами, лёгкой вариацией тона
 * и поправкой на настроение (похвала, поддержка, предупреждение).
 */
export function speakText(text: string, options: SpeakOptions = {}) {
  if (!isVoiceEnabled()) return
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return

  const { character, mood = 'neutral', rateScale = 1, volume, onEnd } = options
  const synth = window.speechSynthesis
  const profile = character ? VOICE_PROFILES[character] : NEUTRAL_PROFILE
  const tuning = MOOD_TUNING[mood]
  const chunks = chunkForSpeech(humanize(text.slice(0, MAX_SPEECH_LENGTH)))
  if (!chunks.length) return

  resetSpeech()
  const token = speakToken

  const speakChunk = (index: number) => {
    if (token !== speakToken) return
    if (index >= chunks.length) {
      onEnd?.()
      return
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index])
    const voice = pickVoice(character)
    if (voice) utterance.voice = voice
    utterance.lang = voice?.lang ?? 'ru-RU'

    const drift = variation(index)
    utterance.rate = clamp(profile.rate * rateScale + tuning.rate + drift.rate, 0.6, 2)
    utterance.pitch = clamp(profile.pitch + tuning.pitch + drift.pitch, 0.5, 1.8)
    utterance.volume = clamp(volume ?? profile.volume, 0, 1)

    const proceed = () => {
      if (token !== speakToken) return
      const gap = Math.max(60, profile.gap + tuning.gap)
      pendingTimer = window.setTimeout(() => speakChunk(index + 1), gap)
    }
    utterance.onend = proceed
    utterance.onerror = proceed

    try {
      synth.speak(utterance)
    } catch {
      /* синтез недоступен */
    }
  }

  // Если голоса ещё не загрузились, первая фраза подождёт их появления.
  // Небольшая задержка нужна ещё и потому, что Chrome иногда «проглатывает»
  // реплику, начатую сразу после cancel().
  whenVoicesReady(() => {
    pendingTimer = window.setTimeout(() => speakChunk(0), 60)
  })
}

/** Озвучить реплику героя с учётом его характера и настроения. */
export function speakHero(text: string, character?: CharacterId, mood: HeroMood = 'neutral') {
  speakText(text, { character, mood })
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  resetSpeech()
}