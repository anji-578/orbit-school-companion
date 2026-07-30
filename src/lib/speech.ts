interface SpeechRecognitionAlternativeLike {
  transcript: string
}

interface SpeechRecognitionResultLike {
  readonly length: number
  [index: number]: SpeechRecognitionAlternativeLike
  isFinal: boolean
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionErrorEventLike {
  error: string
}

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export interface VoiceRecognitionHandle {
  stop: () => void
}

export function startVoiceRecognition(
  onResult: (transcript: string) => void,
  onError: (message: string) => void,
): VoiceRecognitionHandle | null {
  const RecognitionCtor = getSpeechRecognitionCtor()
  if (!RecognitionCtor) {
    onError('Voice recognition is not supported in this browser.')
    return null
  }

  const recognition = new RecognitionCtor()
  recognition.lang = 'en-IN'
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onresult = (event) => {
    const result = event.results[event.resultIndex]
    const transcript = result?.[0]?.transcript ?? ''
    if (transcript.trim().length > 0) {
      onResult(transcript.trim())
    }
  }

  recognition.onerror = (event) => {
    onError(event.error || 'Voice recognition error.')
  }

  try {
    recognition.start()
  } catch {
    onError('Unable to start voice recognition.')
    return null
  }

  return {
    stop: () => {
      try {
        recognition.stop()
      } catch {
        // no-op: recognition may already be stopped
      }
    },
  }
}

export interface SpeechHandle {
  speaking: boolean
  cancel: () => void
}

function stripMarkdownSymbols(text: string): string {
  return text
    .replace(/[#*_`$]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

const NOOP_HANDLE: SpeechHandle = { speaking: false, cancel: () => {} }

export function speakText(text: string, lang: 'en' | 'te'): SpeechHandle {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    return NOOP_HANDLE
  }

  const cleaned = stripMarkdownSymbols(text)
  if (cleaned.length === 0) {
    return NOOP_HANDLE
  }

  const synth = window.speechSynthesis
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(cleaned)
  utterance.lang = lang === 'te' ? 'te-IN' : 'en-IN'
  utterance.rate = 0.98
  utterance.pitch = 1

  synth.speak(utterance)

  return {
    speaking: true,
    cancel: () => {
      try {
        synth.cancel()
      } catch {
        // no-op: synthesis may already be idle
      }
    },
  }
}
