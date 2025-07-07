import { type WebsiteEnvironment } from '../environment.ts'
import { Component, createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { UrlPath } from '../support/url_path.ts'
import { type AriaCurrentValue } from '../types/aria.ts'
import { type Action } from '../types/typecons.ts'

interface IAnchorState {
  href: UrlPath | string
  ariaCurrent?: AriaCurrentValue
  class?: string
  disabled?: boolean
  isInternal?: boolean
  newTab?: boolean
  rel?: string
  role?: string
  style?: string
  text?: string
  title?: string
}

interface IDisabledAnchorElementState {
  ['aria-current']?: string
  class?: string
  click?: Action<MouseEvent>
  href?: string
  rel?: string
  role?: string
  style?: string
  target?: string
  text?: string
  title?: string
}

/**
 * A wrapper around anchor tags that handles internal links and disabled states.
 *
 * According to [1],
 *   If a link needs to be programmatically communicated as "disabled", remove the href attribute.
 *
 * This is confirmed in [2]
 *
 * We do not set the aria-disabled attribute since it is not recommended in [1]
 *
 * [1] https://w3c.github.io/html-aria/#el-a
 * [2] https://stackoverflow.com/a/10510353/2756776
 */
export function anchor(state: IAnchorState, env: WebsiteEnvironment, children: Component[]) {
  const childState: IDisabledAnchorElementState = {
    class: classlist(state.class, state.disabled && 'disabled-anchor'),
    title: state.title,
    style: state.style,
    rel: state.rel,
    role: state.role,
    ['aria-current']: state.ariaCurrent,
  }

  if ('text' in state) {
    childState.text = state.text
  } else if (children.length === 0 && state.href) {
    childState.text = state.href.toString()
  }

  if (state.disabled) {
    childState.role = state.role ?? 'link'
  } else {
    childState.href = encodeURI(state.href.toString())

    if (state.isInternal) {
      childState.click = function click(event: MouseEvent) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
          return
        }

        env.urlPath$.next(state.href instanceof UrlPath ? state.href : UrlPath.parse(state.href))
        event.preventDefault()
      }
    }
  }

  if (state.newTab) {
    childState.target = '_blank'
  }

  return c.html('a', childState, ...children)
}
