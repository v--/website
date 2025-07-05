import { AssertionError } from 'node:assert/strict'

import { BasePage } from './base.ts'
import { Anchor } from './support/anchor.ts'
import { getSortingDirection } from './support/locator.ts'
import { repr } from '../../common/support/strings.ts'
import { type Infer, Schema, validateSchema } from '../../common/validation.ts'

export const DIR_ENTRY_ROW_SCHEMA = Schema.object({
  name: Schema.string,
  type: Schema.string,
  modified: Schema.string,
  size: Schema.string,
})

export type IDirEntryRow = Infer<typeof DIR_ENTRY_ROW_SCHEMA>

export class FilesPage extends BasePage {
  async getDirPath() {
    const title = await this._pwPage.title()
    const match = title.match(/Index of \/files(?<dir>.*) \| ivasilev.net/)

    if (match === null || match.groups === undefined) {
      throw new AssertionError({
        message: `Cannot infer directory path from title ${repr(title)}`,
      })
    }

    return match.groups['dir'] || '/' // Replace the empty string with '/'
  }

  async getBreadcrumbLocators() {
    const navigation = this._pwPage.locator('.breadcrumb-navigation').first()
    const locators = await navigation.getByRole('link').all()
    return Object.fromEntries(
      await Promise.all(
        locators.map(async l => [await l.innerText(), new Anchor(l)] as [string, Anchor]),
      ),
    )
  }

  getReadmeLocator() {
    return this._pwPage.getByRole('article').first()
  }

  getTableLocator() {
    return this._pwPage.getByRole('table').first()
  }

  async hasTable() {
    return this.getTableLocator().isVisible()
  }

  #getTableHeader(id: string) {
    return this.getTableLocator().locator('th#' + id)
  }

  async getTableHeaderAnchor(id: string) {
    const locator = this.#getTableHeader(id).getByRole('link').first()
    return new Anchor(locator)
  }

  async getTableHeaderSortDirection(id: string) {
    const header = this.#getTableHeader(id)
    return await getSortingDirection(header)
  }

  #getShownDirLocator() {
    return this.getTableLocator().locator('tbody').first().getByRole('row')
  }

  getDirEntryAnchor(name: string) {
    const locator = this.#getShownDirLocator().getByText(name).first()
    return new Anchor(locator)
  }

  async getShownDirEntries(): Promise<IDirEntryRow[]> {
    const rows = await this.#getShownDirLocator().all()
    const promises = rows.map(async row => {
      const cells = await row.getByRole('cell').all()
      const entry: Record<string, string> = {}

      for (const cell of cells) {
        const headerId = await cell.getAttribute('headers')

        if (headerId) {
          entry[headerId] = await cell.innerText()
        }
      }

      return validateSchema(DIR_ENTRY_ROW_SCHEMA, entry)
    })

    return Promise.all(promises)
  }

  getPaginatorLocator() {
    return this._pwPage.locator('.paginator').first()
  }

  async hasPaginator() {
    return this.getPaginatorLocator().isVisible()
  }

  getPaginatorPrevAnchor() {
    return new Anchor(this.getPaginatorLocator().locator('.paginator-anchor-prev').first())
  }

  getPaginatorNextAnchor() {
    return new Anchor(this.getPaginatorLocator().locator('.paginator-anchor-next').first())
  }

  async getPaginatorNumberAnchors() {
    const locators = await this.getPaginatorLocator().locator('.paginator-anchor-direct').all()
    return locators.map(l => new Anchor(l))
  }
}
