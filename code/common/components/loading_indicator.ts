import { createComponent as c } from '../rendering/component.ts'

// Whether the indicator is shown or not is determined in runtime.ts
export function loadingIndicator(_state: unknown) {
  return c.html('div',
    {
      popover: 'manual',
      id: 'loading-indicator',
      class: 'loading-indicator',
    },
    c.html('div', { class: 'loading-indicator-bar' }),
  )
}
