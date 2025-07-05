import { type Locator } from '@playwright/test'

import { getLocatorClasses, waitForStableState } from './locator.ts'

export class Anchor {
  locator: Locator

  constructor(locator: Locator) {
    this.locator = locator
  }

  async click() {
    await this.locator.click()

    // This is for static rendering (when JavaScript is disabled)
    await this.locator.page().waitForLoadState()

    // This is for dynamic rendering (when JavaScript is enabled)
    await waitForStableState(this.locator)
  }

  async isEnabled() {
    const classes = await getLocatorClasses(this.locator)
    return !classes.includes('disabled-anchor')
  }

  async textContent() {
    return this.locator.textContent()
  }
}
