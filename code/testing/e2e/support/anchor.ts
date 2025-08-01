import { type Locator } from '@playwright/test'

import { type BasePage } from '../base.ts'

export class Anchor {
  page: BasePage
  locator: Locator

  constructor(page: BasePage, locator: Locator) {
    this.page = page
    this.locator = locator
  }

  async click() {
    await this.locator.click()

    if (await this.page.isContentDynamic()) {
      await this.page.waitWhileLoading()
    } else {
      await this.locator.page().waitForLoadState()
    }
  }

  async isDisabled() {
    const href = await this.locator.getAttribute('href')
    return href === null
  }

  async isEnabled() {
    return !(await this.isDisabled())
  }

  async textContent() {
    return this.locator.textContent()
  }
}
