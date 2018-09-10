import { c, Component } from '../rendering/component.mjs'

function * headers (columns) {
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i]

    let inner

    if (column.header instanceof Component) {
      inner = column.header
    } else {
      inner = c('div', { class: 'heading' },
        c('span', { text: column.label })
      )
    }

    yield c('th', { title: column.label, class: column.class }, inner)
  }
}

function * row (columns, datum) {
  for (const column of columns) {
    let value = column.view || column.value

    if (typeof value === 'function') {
      value = value(datum)
    }

    yield c('td', { title: value, class: column.class },
      value instanceof Component ? value : c('span', { text: value })
    )
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
