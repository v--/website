import { c, Component } from '../rendering/component.mjs'

import icon from './icon.mjs'
import link from './link.mjs'

function evalMappingData (mapping, datum, index) {
  const result = {}

  if (!mapping) {
    return result
  }

  for (const [key, value] of Object.entries(mapping)) {
    if (typeof value === 'function') {
      const val = value(datum, index)

      if (val !== undefined) {
        result[key] = val
      }
    } else if (value !== undefined) {
      result[key] = value
    }
  }

  return result
}

function cellBody ({ link: linkData, value, class: cssClass, style }, children) {
  if (value instanceof Component) {
    return value
  }

  const childState = {}

  if (cssClass) {
    childState.class = cssClass
  }

  if (style) {
    childState.style = style
  }

  if (value && typeof value === 'string') {
    childState.text = value
  }

  if (linkData) {
    childState.isInternal = linkData.isInternal
    childState.link = linkData.url

    return c(link, childState, ...children)
  }

  return c('span', childState, ...children)
}

function * headers (headerConfig, columns) {
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i]
    const data = evalMappingData(headerConfig, column, i)

    for (const [key, value] of Object.entries(column)) {
      if (!data.hasOwnProperty(key) && typeof value === 'string') {
        data[key] = value
      }
    }

    yield c('th', { title: data.label, class: data.class, style: data.style },
      c(cellBody, { class: 'heading', link: data.link },
        data.icon && c(icon, { name: data.icon }),
        c('span', { text: data.label })
      )
    )
  }
}

function * row (columns, datum) {
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i]

    const data = evalMappingData(column, datum, i)
    const value = data.view || data.value

    yield c('td', { title: value, class: data.class, style: data.style },
      c(cellBody, { value, link: data.link })
    )
  }
}

function * rows (columns, data) {
  for (const datum of data) {
    yield c('tr', null, ...row(columns, datum))
  }
}

export default function table ({ class: cssClass, style, columns, headers: headerConfig, data }, children) {
  return c('table', { class: cssClass, style },
    c('thead', null,
      c('tr', null, ...headers(headerConfig, columns))
    ),

    c('tbody', null, ...rows(columns, data)),
    ...children
  )
}
