import { type Component } from '../rendering/component.ts'
import { type ITranslationSpec } from '../translation.ts'

export interface IVerticalTableColumnSpec<T> {
  id: string
  label?: ITranslationSpec
  value: string | Component | ((datum: T) => string | Component)
  header?: Component
  headerAria?: Record<string, string>
  class?: string
}
