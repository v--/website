import { c } from '../rendering/component.js'

import { link } from '../components/link.js'
import { markdown } from '../components/markdown.js'
import { interactiveTable } from '../components/interactive_table.js'
import { breadcrumbsTitle } from '../components/breadcrumbs_title.js'
import { ccNotice } from '../components/cc_notice.js'

function getFileExtension (fileName) {
  const extIndex = fileName.lastIndexOf('.')

  if (extIndex !== -1) {
    return fileName.slice(extIndex + 1).toUpperCase()
  }

  return ''
}

export function files ({ path, data }) {
  const columns = [
    {
      label: 'Name',
      class: 'col-name',
      value (entry) {
        return c(link, {
          text: entry.name,
          link: path.join(entry.name).underCooked,
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

        const ext = getFileExtension(entry.name)
        return ext.length > 0 ? `File: ${ext}` : 'Dotfile'
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
        return new Date(entry.modified).toUTCString()
      },
      value (entry) {
        return Date.parse(entry.modified)
      }
    }
  ]

  return c('div', { class: 'page files-page' },
    c(breadcrumbsTitle, { path, root: '/files' }),
    c('div', { class: 'files-table-container' },
      c(interactiveTable, {
        class: 'files-table',
        data: data.entries,
        defaultSorting: 2,
        columns,
        path
      }),

      data.readme && c('br'),
      data.readme && c(markdown, { source: data.readme })
    ),
    c(ccNotice)
  )
}
