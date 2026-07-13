import { AssertionError } from 'assert'

import { type GamePhase } from '../../../client/breakout/types.ts'
import { repr } from '../../../common/support/strings.ts'
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

  getDrawerMenu() {
    return this._pwPage.locator('.playground-menu-drawer-popover')
  }

  getDebugToggle() {
    return new Checkbox(this, this.getInlineMenuLocator().getByText('Debug mode', { exact: true }))
  }

  getVirtualButtonToggle() {
    return new Checkbox(this, this.getInlineMenuLocator().getByText('Virtual controls', { exact: true }))
  }

  getResetButton() {
    return new Button(this, this.getInlineMenuLocator().getByText('Reset', { exact: true }))
  }

  async isMenuExpanded() {
    return await this.getResetButton().isVisible()
  }

  getVirtualButtonLocators() {
    return {
      left: new Button(this, this._pwPage.locator('.breakout-controller-button-left').first()),
      right: new Button(this, this._pwPage.locator('.breakout-controller-button-right').first()),
    }
  }

  getGhostBallLocators() {
    return this._pwPage.locator('.breakout-trace-ghost').all()
  }

  getStageLocator() {
    return this._pwPage.locator('.breakout')
  }

  getGameSplashLocator() {
    return this.getStageLocator().locator('.breakout-splash')
  }

  getGameSplashLocatorMessageLocator() {
    return this.getGameSplashLocator().locator('.breakout-splash-message')
  }

  async getGamePhase(): Promise<GamePhase> {
    if (await this.getGameSplashLocator().isHidden()) {
      return 'running'
    }

    const splashMessage = await this.getGameSplashLocatorMessageLocator().textContent()

    switch (splashMessage) {
      case 'Ready':
        return 'unstarted'

      case 'Paused':
        return 'paused'

      default:
        throw new AssertionError({
          message: `Unrecognized splash message ${repr(splashMessage)}`,
        })
    }
  }

  getSpotlightHeadLocator() {
    return this._pwPage.locator('.spotlight-page-head')
  }

  getSpotlightBodyLocator() {
    return this._pwPage.locator('.spotlight-page-body')
  }
}
