import type { CharacterId } from './characters'

/* ВОССТАНОВЛЕНО по списку экспортов из AdamAssistant.tsx:

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

const VOICE_HINTS: Record<CharacterId, string[]> = {
  adam: ['Pavel', 'Dmitri', 'Milena', 'Google русский'],
  nicole: ['Milena', 'Katya', 'Google русский'],
  cain: ['Dmitri', 'Pavel', 'Google русский'],
  bunny: ['Katya', 'Milena', 'Google русский'],
}

function pickVoice(character?: CharacterId): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const hints = character ? VOICE_HINTS[character] : []
  for (const hint of hints) {
    const match = voices.find((voice) => voice.name.includes(hint))
    if (match) return match
  }

  return voices.find((voice) => voice.lang?.startsWith('ru')) ?? voices[0] ?? null
}

const MAX_SPEECH_LENGTH = 600

/** Озвучить реплику героя (первые 600 символов). */
export function speakHero(text: string, character?: CharacterId) {
  if (!isVoiceEnabled()) return
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return

  try {
    stopSpeaking()
    const utterance = new SpeechSynthesisUtterance(text.slice(0, MAX_SPEECH_LENGTH))
    const voice = pickVoice(character)
    if (voice) utterance.voice = voice
    utterance.lang = voice?.lang ?? 'ru-RU'
    utterance.rate = 1
    utterance.pitch = character === 'bunny' ? 1.15 : character === 'cain' ? 0.9 : 1
    window.speechSynthesis.speak(utterance)
  } catch {
    /* синтез речи недоступен */
  }
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* игнорируем */
  }
}