import { c } from '../component'

import icon from './icon'
import link from './link'

function evalColumnData (column, datum) {
  const result = {}

  for (const [key, value] of Object.entries(column)) {
    if (typeof value === 'function') {
      const val = value(datum)

      if (val !== undefined) {
        result[key] = val
      }
    } else if (value !== undefined) {
      result[key] = value
    }
  }

  return result
}

function * headers (columns) {
  for (let i = 1; i <= columns.length; i++) {
    const column = columns[i - 1]
    const data = evalColumnData(column, null)

    yield c('th', { title: data.label, class: data.class, style: data.style },
      c(data.link ? link : 'div', { class: 'heading', isInternal: data.link && data.link.isInternal, link: data.link && data.link.url },
        data.icon && c(icon, { name: data.icon }),
        c('span', { text: data.label })
      )
    )
  }
}

function * row (columns, datum) {
  for (const column of columns) {
    const data = evalColumnData(column, datum)
    const value = data.view || data.value

    if ('link' in data) {
      const { url, isInternal } = data.link

      yield c('td', { title: value, class: data.class, style: data.style },
        c(link, {
          text: value,
          link: url,
          isInternal: isInternal
        })
      )
    } else {
      yield c('td', { title: value, class: data.class, style: data.style },
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

export default function table ({ class: cssClass, style, columns, data }, children) {
  return c('table', { class: cssClass, style },
    c('thead', null,
      c('tr', null, ...headers(columns))
    ),

    c('tbody', null, ...rows(columns, data)),
    ...children
  )
}
