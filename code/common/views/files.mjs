import { c } from '../component'

import section from '../components/section'
import markdown from '../components/markdown'
import interactiveTable from '../components/interactive_table'

export default function files ({ path, data, id }) {
  function getLink (entry) {
    if (entry.name === '..') {
      const ancestors = id.split('/')
      ancestors.pop()
      return '/' + ancestors.join('/')
    }

    return `/${id}/${entry.name}`
  }

  const columns = [
    {
      label: 'Name',
      class: 'col-name',
      value (entry) {
        return entry.name
      },
      link (entry) {
        return {
          url: getLink(entry),
          isInternal: !entry.isFile
        }
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

        return new Date(entry.modified).toLocaleString()
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
    c(section, { title: `Index of /${id}` },
      c(interactiveTable, {
        class: 'files-table',
        data: dynamic,
        fixedData: fixed,
        columns,
        path
      }),

      data.readme && c('br'),
      data.readme && c(markdown, { text: data.readme })
    )
  )
}
