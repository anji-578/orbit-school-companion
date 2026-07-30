import type { Lang } from '../types'
import { messages, languagesList } from './messages'

export { languagesList, messages }

export type MessageKey = keyof typeof messages.en

export function translate(lang: Lang, key: MessageKey | string): string {
  const dict = messages[lang] ?? messages.en
  return (dict as Record<string, string>)[key] ?? messages.en[key as MessageKey] ?? key
}
