import { c } from '../rendering/component.mjs'

import link from '../components/link.mjs'
import interactiveTable from '../components/interactive_table.mjs'

export default function files ({ path, data }) {
  const columns = [
    {
      label: 'Name',
      class: 'col-name',
      value (entry) {
        return c(link, {
          text: entry.name,
          link: (entry.name === '..' ? path.parent : path.join(entry.name)).underCooked,
          isInternal: !entry.isFile
        })
      }
    },

    {
      label: 'Type',
      class: 'col-type',
      value (entry) {
        if (!entry.isFile) {
          return 'Directory'
        }

        const extIndex = entry.name.lastIndexOf('.')

        if (~extIndex) {
          return entry.name.slice(extIndex + 1).toUpperCase() + ' file'
        }

        return 'Dotfile'
      }
    },

    {
      label: 'Size',
      class: 'col-size',
      view (entry) {
        if (!entry.isFile) {
          return '-'
        }

        if (entry.size < 1024) {
          return `${entry.size} Bytes`
        }

        let ratio = entry.size / 1024

        for (const size of 'KMGTP') {
          if (ratio < 512) {
            return `${ratio.toFixed(2)} ${size}iB`
          }

          ratio /= 1024
        }

        return 'Invalid size'
      },
      value (entry) {
        return entry.size
      }
    },

    {
      label: 'Modified',
      class: 'col-modified',
      view (entry) {
        if (entry.name === '..') {
          return '-'
        }

        return new Date(entry.modified).toUTCString()
      },
      value (entry) {
        return Date.parse(entry.modified)
      }
    }
  ]

  const fixed = []
  const dynamic = []

  for (const entry of data.entries) {
    if (entry.name === '..') {
      fixed.push(entry)
    } else {
      dynamic.push(entry)
    }
  }

  return c('div', { class: 'page files-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: `Index of ${path.underCooked}` }),
      c(interactiveTable, {
        class: 'files-table',
        data: dynamic,
        fixedData: fixed,
        columns,
        path
      }),

      data.readme && c('br'),
      data.readme && c('div', { html: data.readme })
    )
  )
}
