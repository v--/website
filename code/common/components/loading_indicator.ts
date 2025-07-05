import { c } from '../rendering/component.ts'

interface ILoadingIndicatorState {
  loading: boolean
}

export function loadingIndicator({ loading }: ILoadingIndicatorState) {
  return c('div', { class: 'require-javascript loading-indicator' },
    loading && c('div', { class: 'loading-indicator-bar' }),
  )
}
