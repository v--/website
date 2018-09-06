import { c } from '../component'

import icon from './icon'
import link from './link'

function * headers (columns) {
  for (let i = 1; i <= columns.length; i++) {
    const column = columns[i - 1]

    yield c('th', { class: column.class, title: column.label },
      c(column.headerLink ? link : 'div', { class: 'heading', isInternal: true, link: column.headerLink },
        column.icon && c(icon, { name: column.icon }),
        c('span', { text: column.label })
      )
    )
  }
}

function * row (columns, datum) {
  for (const column of columns) {
    const value = (column.view || column.value)(datum)

    if ('link' in column) {
      const { url, isInternal } = column.link(datum)

      yield c('td', { title: value, class: column.class },
        c(link, {
          text: value,
          link: url,
          isInternal: isInternal
        })
      )
    } else {
      yield c('td', { title: value, class: column.class },
        c('span', {
          text: value
        })
      )
    }
  }
}

function * rows (columns, data) {
  for (const datum of data) {
    yield c('tr', null, ...row(columns, datum))
  }
}

export default function table ({ class: cssClass, columns, data }, children) {
  return c('table', { class: cssClass },
    c('thead', null,
      c('tr', null, ...headers(columns))
    ),

    c('tbody', null, ...rows(columns, data)),
    ...children
  )
}
