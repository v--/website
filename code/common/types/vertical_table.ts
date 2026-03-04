import { type WebsiteEnvironment } from '../environment.ts'
import { type Observable } from '../observable.ts'
import { type Component, type FactoryComponentType } from '../rendering/component.ts'
import { type ITranslationSpec } from '../translation.ts'

export interface IVerticalTableColumnSpec<T> {
  id: string
  label?: ITranslationSpec
  value: string | Observable<string> | Component | ((datum: T) => string | Observable<string> | Component)
  header?: FactoryComponentType<object, WebsiteEnvironment>
  headerAria?: Record<string, string>
  class?: string
}
