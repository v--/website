import { c, Component } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'

export interface ITableColumn {
  label?: string
  header?: Component
  class?: string
  view?(datum: unknown): unknown
  value(datum: unknown): unknown
}

function * headers(columns: ITableColumn[]): Generator<Component> {
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

function * row(columns: ITableColumn[], datum: unknown): Generator<Component> {
  for (const column of columns) {
    let value: unknown = column.view || column.value

    if (typeof value === 'function') {
      value = value(datum)
    }

    yield c('td', { title: value, class: column.class },
      value instanceof Component ? value : c('span', { text: value })
    )
  }
}

function * rows(columns: ITableColumn[], data: unknown[]) {
  for (const datum of data) {
    yield c('tr', undefined, ...row(columns, datum))
  }
}

export function table({
  class: cssClass,
  columns,
  data,
  style
}: {
  columns: ITableColumn[],
  data: unknown[],
  class?: string,
  style?: string
}, children: TComponents.IComponent[]) {
  return c('table', { class: classlist('cool-table', cssClass), style },
    c('thead', undefined,
      c('tr', undefined, ...headers(columns))
    ),

    c('tbody', undefined, ...rows(columns, data)),
    ...children
  )
}
