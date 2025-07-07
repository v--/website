import { createComponent as c } from '../rendering/component.ts'

interface ILoadingIndicatorState {
  loading: boolean
}

export function loadingIndicator({ loading }: ILoadingIndicatorState) {
  return c.html('div', { class: 'require-javascript loading-indicator' },
    loading && c.html('div', { class: 'loading-indicator-bar' }),
  )
}
