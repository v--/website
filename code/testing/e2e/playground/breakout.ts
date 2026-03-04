import { PlaygroundPage } from '../playground.ts'
import { Button } from '../support/button.ts'
import { Checkbox } from '../support/checkbox.ts'

export class BreakoutPage extends PlaygroundPage {
  getAspectRatioBoxLocator() {
    return this._pwPage.locator('.spotlight-page-aspect-ratio-box')
  }

  getMenuToggleButton() {
    return new Checkbox(this, this._pwPage.locator('.playground-menu-drawer-toggle'))
  }

  getInlineMenuLocator() {
    return this._pwPage.locator('.playground-menu-inline')
  }

  getDrawerMenuLocator() {
    return this._pwPage.locator('.playground-menu-drawer')
  }

  getDrawerMenu() {
    return this._pwPage.locator('.playground-menu-drawer-popover')
  }

  getDebugToggle() {
    return new Checkbox(this, this.getInlineMenuLocator().getByText('Debug mode', { exact: true }))
  }

  getResetButton() {
    return new Button(this, this.getInlineMenuLocator().getByText('Reset', { exact: true }))
  }

  async isMenuExpanded() {
    return await this.getResetButton().isVisible()
  }

  getGhostBallLocators() {
    return this._pwPage.locator('.breakout-trace-ghost').all()
  }

  getStageLocator() {
    return this._pwPage.locator('.breakout').first()
  }
}
