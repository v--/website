import { anchor } from './anchor.ts'
import { createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { reversed } from '../support/iteration/base.ts'
import { UrlPath } from '../support/url_path.ts'

interface IBreadcrumbHeadingState {
  class?: string
  urlPath: UrlPath
}

function* iterTrail(urlPath: UrlPath) {
  let currentPath = urlPath.path

  while (!currentPath.isEmpty()) {
    yield currentPath
    currentPath = currentPath.popRight()
  }
}

export function breadcrumbNavigation({ class: cssClass, urlPath }: IBreadcrumbHeadingState) {
  const fullTrail = reversed(iterTrail(urlPath))

  return c.html('nav', { class: classlist('breadcrumb-navigation', cssClass) },
    ...fullTrail.flatMap(path => {
      const lastSegment = path.getBaseName()
      const active = path.equals(urlPath.path)

      return c.html('span', { class: 'breadcrumb' },
        c.html('span', { class: 'breadcrumb-slash', text: '/' }),
        c.factory(anchor, {
          class: 'breadcrumb-anchor',
          text: lastSegment,
          title: lastSegment,
          href: new UrlPath(path),
          disabled: active,
          ariaCurrent: active ? 'page' : 'false',
          isInternal: true,
        }),
      )
    }),
  )
}
