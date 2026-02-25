import { AssertionError } from 'node:assert/strict'

import { type Browser, type BrowserContext, type Page as PlayWrightPage } from '@playwright/test'

import { BASE_URL, BROWSER } from './config.ts'
import { Anchor } from './support/anchor.ts'
import { Button } from './support/button.ts'
import { type ViewportSizeName, transposeViewport, viewportNameMap } from './support/viewport.ts'
import { type WebsiteLanguageId, parseSupportedLanguageString } from '../../common/languages.ts'
import { UrlPath } from '../../common/support/url_path.ts'
import { type IFinalizeable } from '../../common/types/finalizable.ts'
import { type ColorScheme } from '../../common/types/page.ts'

interface IBasePageOptions {
  javaScriptEnabled?: boolean
  locale?: string
  httpHeaders?: Record<string, string>
  colorScheme?: ColorScheme
  reducedMotion?: 'reduce' | 'no-preference'
}

const LOADING_INDICATOR_WAIT_TIMEOUT = 1000

export class BasePage implements IFinalizeable {
  static async initialize<PageT extends BasePage>(options?: IBasePageOptions): Promise<PageT> {
    const browser = await BROWSER.launch()
    const context = await browser.newContext({
      baseURL: BASE_URL,
      javaScriptEnabled: options?.javaScriptEnabled,
      locale: options?.locale,
      extraHTTPHeaders: { prefer: 'data-source=mocked', ...options?.httpHeaders },
      colorScheme: options?.colorScheme,
      reducedMotion: options?.reducedMotion ?? 'reduce',
    })

    const page = await context.newPage()
    return new this(browser, context, page) as PageT
  }

  readonly #browser: Browser
  readonly #context: BrowserContext
  protected _pwPage: PlayWrightPage

  protected constructor(
    browser: Browser,
    context: BrowserContext,
    pw_page: PlayWrightPage,
  ) {
    this.#browser = browser
    this.#context = context
    this._pwPage = pw_page
  }

  async isContentDynamic() {
    return this._pwPage.locator('.require-javascript').first().isVisible()
  }

  async goto(path: string) {
    await this._pwPage.goto(path)
    await this._pwPage.waitForLoadState('load')

    if (await this.isContentDynamic()) {
      await this._pwPage.waitForSelector('.dynamic-content')
    }
  }

  async captureScreenshot(path: string) {
    await this._pwPage.screenshot({ path, fullPage: true })
  }

  async getTitle() {
    return await this._pwPage.title()
  }

  getUrlPath() {
    return UrlPath.parse(this._pwPage.url())
  }

  async scaleViewport(name: ViewportSizeName, { vertical }: { vertical?: boolean } = {}) {
    const size = vertical ? transposeViewport(viewportNameMap[name]) : viewportNameMap[name]
    await this._pwPage.setViewportSize(size)
  }

  getLoadingIndicatorLocator() {
    return this._pwPage.locator('.loading-indicator')
  }

  isLoading() {
    return this.getLoadingIndicatorLocator().isVisible()
  }

  async waitWhileLoading() {
    try {
      await this.getLoadingIndicatorLocator().waitFor({ state: 'visible', timeout: LOADING_INDICATOR_WAIT_TIMEOUT })
    } catch (err) {
      // Ignore timeout error
    }

    await this.getLoadingIndicatorLocator().waitFor({ state: 'hidden' })
  }

  getSidebarLocator() {
    return this._pwPage.locator('.sidebar').first()
  }

  hasSidebar() {
    return this.getSidebarLocator().isVisible()
  }

  getBodyLocator() {
    return this._pwPage.locator('body').first()
  }

  getPageContainerLocator() {
    return this._pwPage.locator('.page-scroll-container').first()
  }

  getMainLocator() {
    return this._pwPage.locator('main').first()
  }

  async getLanguage(): Promise<WebsiteLanguageId | undefined> {
    return parseSupportedLanguageString(
      await this._pwPage.locator('html').first().getAttribute('lang') ?? undefined,
    )
  }

  async getColorScheme(): Promise<ColorScheme> {
    const locator = this.getBodyLocator()
    const background: string = await locator.evaluate(function (element) {
      return window.getComputedStyle(element).getPropertyValue('--body-color-background')
    })

    const match = background.match(/#(?<r>[0-9a-f])(?<g>[0-9a-f])(?<b>[0-9a-f])/)

    if (match === null) {
      throw new AssertionError({
        message: `Unrecognized color ${background}`,
      })
    }

    const { r, g, b } = match.groups!
    const average = (parseInt(r + r, 16) + parseInt(g + g, 16) + parseInt(b + b, 16)) / 3
    return average < 128 ? 'dark' : 'light'
  }

  async isSidebarActuallyCollapsed(): Promise<boolean> {
    const sidebarWidth = await this.getSidebarLocator()
      .evaluate(
        element => element.clientWidth,
      )

    const collapsibleContentWidth = await this.getSidebarLocator()
      .locator('.sidebar-entry-collapsible-content')
      .first()
      .evaluate(
        element => (element as HTMLElement).offsetWidth,
      )

    return collapsibleContentWidth >= sidebarWidth
  }

  async isSidebarHidden(): Promise<boolean> {
    const sidebarWidth = await this.getSidebarLocator()
      .evaluate(
        element => window.getComputedStyle(element).getPropertyValue('margin-left'),
      )

    return parseInt(sidebarWidth) < 0
  }

  getSidebarToggleLocator() {
    return new Button(this, this._pwPage.locator('.sidebar-toggle').first())
  }

  getSidebarCollapseLocator() {
    return new Button(this, this.getSidebarLocator().locator('.sidebar-collapse-button').first())
  }

  getSidebarLanguageButtons() {
    return {
      en: new Button(this, this.getSidebarLocator().getByRole('radio', { name: 'ENG', exact: true }).first()),
      ru: new Button(this, this.getSidebarLocator().getByRole('radio', { name: 'РУС', exact: true }).first()),
    }
  }

  getSidebarColorLocator() {
    return this.getSidebarLocator().locator('.sidebar-scheme-toggle-button').first()
  }

  async getSidebarAnchors() {
    const locators = await this.getSidebarLocator().getByRole('link').all()
    return locators.map(l => new Anchor(this, l))
  }

  async parseError() {
    const errorTitleLocator = this._pwPage.locator('.error-page-title')
    const errorSubtitleLocator = this._pwPage.locator('.error-page-subtitle')
    const errorDetailsLocator = this._pwPage.locator('.error-page-details')

    if (!(await errorTitleLocator.isVisible())) {
      throw new AssertionError({
        message: 'Expected an error, but no error information found',
      })
    }

    const hasCause = await errorDetailsLocator.isVisible()

    return {
      title: await errorTitleLocator.textContent(),
      subtitle: await errorSubtitleLocator.textContent(),
      details: hasCause ? await errorDetailsLocator.textContent() : undefined,
    }
  }

  async reset() {
    await this._pwPage.close()
    this._pwPage = await this.#context.newPage()
  }

  async finalize() {
    await this.#browser.close()
  }
}
