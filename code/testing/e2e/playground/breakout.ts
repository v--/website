import { PlaygroundPage } from '../playground.ts'

export class BreakoutPage extends PlaygroundPage {
  getAspectRatioBoxLocator() {
    return this._pwPage.locator('.spotlight-page-aspect-ratio-box')
  }

  getMenuToggleLocator() {
    return this._pwPage.locator('.playground-menu-toggle-button')
  }

  getMenuRest() {
    return this._pwPage.locator('.playground-menu-rest')
  }

  async isMenuExpanded() {
    return await this.getMenuToggleLocator().isVisible()
  }

  getDebugToggleLocator() {
    return this._pwPage.getByText('Debug mode', { exact: true })
  }

  getResetButtonLocator() {
    return this._pwPage.getByText('Reset', { exact: true })
  }

  getGhostBallLocators() {
    return this._pwPage.locator('.breakout-rays-ghost').all()
  }

  getStageLocator() {
    return this._pwPage.locator('.breakout').first()
  }
}
