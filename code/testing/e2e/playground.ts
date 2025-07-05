import { BasePage } from './base.ts'
import { getLocatorClasses } from './support/locator.ts'

export class PlaygroundPage extends BasePage {
  async isAtPlaceholder() {
    const classes = await getLocatorClasses(this.getMainLocator())
    return classes.includes('placeholder-page')
  }

  async showsUnsupportedMessage() {
    return this._pwPage.locator('.placeholder-page-unsupported').isVisible()
  }
}
