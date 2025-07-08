import { type LanguageId } from './types.ts'

export function bcp47Encode(lang: LanguageId, separator?: 'dash' | 'underscore') {
  switch (lang) {
    case 'en':
      return separator === 'underscore' ? 'en_US' : 'en-US'

    case 'ru':
      return separator === 'underscore' ? 'ru_RU' : 'ru-RU'

    case 'bg':
      return separator === 'underscore' ? 'bg_BG' : 'bg-BG'
  }
}
