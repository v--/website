import { PlaygroundPage } from '../playground.ts'

export class BreakoutPage extends PlaygroundPage {
  getAspectRatioBoxLocator() {
    return this._pwPage.locator('.spotlight-page-aspect-ratio-box')
  }

  getMenuToggleLocator() {
    return this._pwPage.locator('.playground-menu-toggle-button')
  }

  async isMenuExpanded() {
    return await this.getMenuToggleLocator().isVisible()
  }

  getResetButtonLocator() {
    return this._pwPage.getByText('Reset', { exact: true })
  }
}
