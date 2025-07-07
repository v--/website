import { anchor } from './anchor.ts'
import { icon } from './icon.ts'
import { createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { getPaginatorBounds } from '../support/pagination.ts'
import { type UrlPath } from '../support/url_path.ts'
import { type uint32 } from '../types/numbers.ts'

interface IPaginatorConfig {
  pageCount: uint32
  currentPage: uint32
  getUpdatedPath(page: uint32): UrlPath
  class?: string
}

export function paginator({ pageCount, currentPage, getUpdatedPath, class: cssClass }: IPaginatorConfig) {
  return c.html('nav', { class: classlist('paginator', cssClass) },
    ...iterPaginators(pageCount, currentPage, getUpdatedPath),
  )
}

function* iterPaginators(pageCount: uint32, currentPage: uint32, getUpdatedPath: (page: uint32) => UrlPath) {
  yield c.factory(anchor,
    {
      disabled: currentPage === 0,
      class: classlist('paginator-anchor', 'paginator-anchor-prev'),
      href: getUpdatedPath(currentPage - 1),
      isInternal: true,
    },
    c.factory(icon, {
      refId: 'core',
      name: 'solid/chevron-left',
    }),
  )

  const bounds = getPaginatorBounds(currentPage, pageCount)

  for (let i = bounds.lower; i <= bounds.upper; i++) {
    const active = i === currentPage

    yield c.factory(anchor,
      {
        disabled: i === currentPage,
        ariaCurrent: active ? 'page' : 'false',
        class: classlist('paginator-anchor', 'paginator-anchor-direct'),
        href: getUpdatedPath(i),
        isInternal: true,
      },
      c.html('span', { text: String(i + 1) }),
    )
  }

  yield c.factory(anchor,
    {
      disabled: currentPage === pageCount - 1,
      class: classlist('paginator-anchor', 'paginator-anchor-next'),
      href: getUpdatedPath(currentPage + 1),
      isInternal: true,
    },
    c.factory(icon, {
      refId: 'core',
      name: 'solid/chevron-right',
    }),
  )
}
