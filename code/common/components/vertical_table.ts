import { type WebsiteEnvironment } from '../environment.ts'
import { type Observable } from '../observable.ts'
import { Component, createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { getObjectEntries } from '../support/iteration.ts'
import { type IVerticalTableColumnSpec } from '../types/vertical_table.ts'

interface IVerticalTableState<T> {
  columnSpecs: IVerticalTableColumnSpec<T>[]
  data: T[]
  tableClass?: string
  style?: string
}

export function verticalTable<T = unknown>({ tableClass, columnSpecs, data, style }: IVerticalTableState<T>, env: WebsiteEnvironment) {
  return c.html('table', { class: classlist('vertical-table', 'delimited-table', tableClass), style },
    c.html('thead', undefined,
      c.html('tr', undefined, ...iterHeaderColumns(columnSpecs, env)),
    ),

    c.html('tbody', undefined, ...iterRows(columnSpecs, data)),
  )
}

function* iterHeaderColumns<T>(columnSpecs: IVerticalTableColumnSpec<T>[], env: WebsiteEnvironment) {
  for (let i = 0; i < columnSpecs.length; i++) {
    const column = columnSpecs[i]
    const headerState: Record<string, string | Observable<string>> = { id: column.id, scope: 'col' }

    if (column.label) {
      headerState.label = env.gettext.plain$(column.label)
    }

    if (column.class) {
      headerState.class = column.class
    }

    if (column.headerAria) {
      for (const [prop, value] of getObjectEntries(column.headerAria)) {
        headerState[`aria-${prop}`] = value
      }
    }

    if (column.header instanceof Component) {
      yield c.html('th', headerState, column.header)
    } else {
      if (column.label) {
        headerState.text = env.gettext.plain$(column.label)
      }

      yield c.html('th', headerState)
    }
  }
}

function* iterBodyColumns<T>(columnSpecs: IVerticalTableColumnSpec<T>[], datum: T) {
  for (const column of columnSpecs) {
    const valueSource = column.value
    const viewValue = valueSource instanceof Function ? valueSource(datum) : valueSource

    if (viewValue instanceof Component) {
      yield c.html('td', { headers: column.id, class: column.class }, viewValue)
    } else {
      yield c.html('td', {
        headers: column.id,
        class: column.class,
        text: viewValue,
      })
    }
  }
}

function* iterRows<T>(columnSpecs: IVerticalTableColumnSpec<T>[], data: T[]) {
  for (const datum of data) {
    yield c.html('tr', undefined, ...iterBodyColumns(columnSpecs, datum))
  }
}
