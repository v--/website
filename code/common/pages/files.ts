import { anchor } from '../components/anchor.ts'
import { breadcrumbNavigation } from '../components/breadcrumb_navigation.ts'
import { interactiveTable } from '../components/interactive_table.ts'
import { rich } from '../components/rich.ts'
import { spacer } from '../components/spacer.ts'
import { CC0_URL } from '../constants/url.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { c } from '../rendering/component.ts'
import { type IDirEntry, type IDirectory } from '../services.ts'
import { UrlPath } from '../support/url_path.ts'
import { type IWebsitePageState } from '../types/page.ts'
import { type IInteractiveTableColumnSpec } from '../types/table_interaction.ts'

export function filesPage({ urlPath, pageData }: IWebsitePageState<IDirectory>, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('files')
  const columnSpecs = getColumnSpecs(urlPath)
  const { entries, readme } = pageData

  return c('main', { class: 'files-page' },
    c('h1', { text: _('heading') }),
    c(breadcrumbNavigation, { urlPath }),
    c('div', { class: 'files-page-content' },
      entries.length > 0 && c(interactiveTable<IDirEntry>, { class: 'files-page-table delimited-table', data: entries, columnSpecs, urlPath }),
      readme && c(spacer, { dynamics: 'mp' }), // The spacer fits well even if there is no table
      readme && c(rich, { rootTag: 'section', rootCssClass: 'files-page-content-readme', doc: readme }),
    ),
    c(rich, {
      doc: _.rich$({
        key: 'cc_notice',
        context: { ccUrl: CC0_URL },
      }),
    }),
  )
}

function getFileExtension(fileName: string): string | undefined {
  const extIndex = fileName.lastIndexOf('.')

  if (extIndex !== -1) {
    return fileName.slice(extIndex + 1).toUpperCase()
  }

  return undefined
}

function getFileTypeString(entry: IDirEntry) {
  if (entry.isDir) {
    return 'Directory'
  }

  const ext = getFileExtension(entry.name)
  return ext === undefined ? 'File' : `File: ${ext}`
}

function getColumnSpecs(urlPath: UrlPath): Array<IInteractiveTableColumnSpec<IDirEntry>> {
  return [
    {
      id: 'name',
      label: { bundleId: 'files', key: 'table.heading.name' },
      class: 'col-name',
      value(entry: IDirEntry) {
        return c(anchor, {
          text: entry.name,
          title: entry.name,
          href: new UrlPath(urlPath.path.pushRight(entry.name)),
          isInternal: entry.isDir,
        })
      },

      sortingValue(entry: IDirEntry) {
        return entry.name
      },
    },

    {
      id: 'type',
      label: { bundleId: 'files', key: 'table.heading.type' },
      class: 'col-type',
      value(entry: IDirEntry) {
        return getFileTypeString(entry)
      },

      sortingValue(entry: IDirEntry) {
        return getFileTypeString(entry) + entry.name
      },
    },

    {
      id: 'size',
      label: { bundleId: 'files', key: 'table.heading.size' },
      class: 'col-size',
      value(entry: IDirEntry) {
        if (entry.isDir) {
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

      sortingValue(entry: IDirEntry) {
        if (entry.isDir) {
          return Number.NEGATIVE_INFINITY
        }

        return entry.size
      },
    },
  ]
}
