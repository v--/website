import { anchor } from '../components/anchor.ts'
import { breadcrumbNavigation } from '../components/breadcrumb_navigation.ts'
import { interactiveTable } from '../components/interactive_table.ts'
import { rich } from '../components/rich.ts'
import { CC0_URL } from '../constants/url.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { type LanguageId, bcp47Encode } from '../languages.ts'
import { map } from '../observable.ts'
import { createComponent as c } from '../rendering/component.ts'
import { type IDirEntry, type IDirectory } from '../services.ts'
import { UrlPath } from '../support/url_path.ts'
import { type BoundGetText, type IBoundGetTextSpec } from '../translation.ts'
import { type IWebsitePageState } from '../types/page.ts'
import { type IInteractiveTableColumnSpec } from '../types/table_interaction.ts'

export function filesPage({ urlPath, pageData }: IWebsitePageState<IDirectory>, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('files')
  const columnSpecs = getColumnSpecs(_, urlPath)
  const { entries, readme } = pageData

  return c.html('main', { class: 'files-page' },
    c.html('h1', { text: _('heading.main') }),
    c.factory(breadcrumbNavigation, { urlPath }),
    entries.length > 0 && c.factory(interactiveTable<IDirEntry>, { class: 'files-page-table delimited-table', data: entries, columnSpecs, urlPath }),
    c.factory(filesPageNotices, { directory: pageData, currentLanguage: env.gettext.language$ }),
    readme && c.factory(rich, {
      rootTag: 'section',
      rootAttributes: { lang: bcp47Encode(readme.languageId) },
      rootCssClass: 'files-page-readme',
      doc: readme.doc,
    }),
  )
}

interface IFilesPageNoticesState {
  directory: IDirectory
  currentLanguage: LanguageId
}

export function filesPageNotices({ directory, currentLanguage }: IFilesPageNoticesState, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('files')
  const { entries, readme } = directory

  return c.html('dl', { class: 'notice-list files-page-notices' },
    entries.length > 0 && c.factory(rich, {
      mode: 'paragraph',
      rootTag: 'dd',
      rootCssClass: 'notice-success',
      doc: _.rich$({
        key: 'notice.cc',
        context: { ccUrl: CC0_URL },
      }),
    }),
    readme && currentLanguage !== readme.languageId && c.factory(rich, {
      rootCssClass: 'notice-warning',
      mode: 'paragraph',
      rootTag: 'dd',
      doc: _.rich(`notice.language.${readme.languageId}`),
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

function getFileTypeSpec(entry: IDirEntry): IBoundGetTextSpec | string {
  if (entry.isDir) {
    return 'table.data.type.dir'
  }

  const ext = getFileExtension(entry.name)

  if (ext === undefined) {
    return 'table.data.type.file_noext'
  }

  return {
    key: 'table.data.type.file_ext',
    context: { ext },
  }
}

function getFileSizeSpec(entry: IDirEntry): IBoundGetTextSpec | string {
  if (entry.isDir) {
    return 'table.data.size.directory'
  }

  if (entry.size === 0) {
    return 'table.data.size.empty'
  }

  if (entry.size === 1) {
    return 'table.data.size.byte'
  }

  if (entry.size < 1024) {
    return {
      key: 'table.data.size.bytes',
      context: { size: entry.size },
    }
  }

  let ratio = entry.size / 1024

  for (const unitPrefix of 'KMGTP') {
    if (ratio < 512) {
      return {
        key: 'table.data.size.rounded',
        context: {
          roundedSize: ratio.toFixed(2),
          unit: `${unitPrefix}iB`,
        },
      }
    }

    ratio /= 1024
  }

  return 'table.data.size.invalid'
}

function getColumnSpecs(gettext: BoundGetText, urlPath: UrlPath): Array<IInteractiveTableColumnSpec<IDirEntry>> {
  return [
    {
      id: 'name',
      label: { bundleId: 'files', key: 'table.heading.name' },
      class: 'col-name',
      value(entry: IDirEntry) {
        return c.factory(anchor, {
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
        return gettext(getFileTypeSpec(entry))
      },
      sortingValue(entry: IDirEntry) {
        return gettext(getFileTypeSpec(entry)).pipe(
          map(text => text + entry.name),
        )
      },
    },

    {
      id: 'size',
      label: { bundleId: 'files', key: 'table.heading.size' },
      class: 'col-size',
      value(entry: IDirEntry) {
        return gettext(getFileSizeSpec(entry))
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
