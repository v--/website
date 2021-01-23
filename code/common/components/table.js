import { c, Component } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'

/**
 * @typedef {{
  label: string
  header: Component
  class: string
  view: (datum: any) => string
  value: (datum: any) => any
 }} ITableColumn
 */

/**
 * @param {ITableColumn[]} columns
 * @returns {Generator<Component>}
 */
function * headers(columns) {
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

/**
 * @param {ITableColumn[]} columns
 * @param {unknown} datum
 * @returns {Generator<Component>}
 */
function * row(columns, datum) {
  for (const column of columns) {
    /** @type {unknown} */
    let value = column.view || column.value

    if (typeof value === 'function') {
      value = value(datum)
    }

    yield c('td', { title: value, class: column.class },
      value instanceof Component ? value : c('span', { text: value })
    )
  }
}

/**
 * @param {ITableColumn[]} columns
 * @param {unknown[]} data
 * @returns {Generator<Component>}
 */
function * rows(columns, data) {
  for (const datum of data) {
    yield c('tr', undefined, ...row(columns, datum))
  }
}

/**
 * @param {{
 *   columns: ITableColumn[],
 *   data: unknown[],
 *   class?: string,
 *   style?: string
 * }} state
 * @param {TComponents.IComponent[]} children
 */
export function table({
  class: cssClass,
  columns,
  data,
  style
}, children) {
  return c('table', { class: classlist('cool-table', cssClass), style },
    c('thead', undefined,
      c('tr', undefined, ...headers(columns))
    ),

    c('tbody', undefined, ...rows(columns, data)),
    ...children
  )
}
