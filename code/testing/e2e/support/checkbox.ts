import { type Locator } from '@playwright/test'

import { waitForStableState } from './locator.ts'
import { type BasePage } from '../base.ts'

export class Checkbox {
  page: BasePage
  locator: Locator

  constructor(page: BasePage, locator: Locator) {
    this.page = page
    this.locator = locator
  }

  async click({ expectLoadingIndicator }: { expectLoadingIndicator?: boolean } = {}) {
    await this.locator.click()

    if (expectLoadingIndicator) {
      await this.page.waitWhileLoading()
    }

    await waitForStableState(this.locator)
  }

  async isChecked() {
    return await this.locator.isChecked()
  }

  async isDisabled() {
    return await this.locator.isDisabled()
  }

  async isEnabled() {
    return !(await this.isDisabled())
  }

  async isVisible() {
    return await this.locator.isVisible()
  }

  async textContent() {
    return this.locator.textContent()
  }
}
