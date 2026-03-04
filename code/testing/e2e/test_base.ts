import assert from 'node:assert/strict'
import { after, beforeEach, describe, it } from 'node:test'

import { assertFalse, assertTrue } from '../assertion.ts'
import { BasePage } from './base.ts'

describe('General website behavior', function () {
  describe('with only static settings', function () {
    it('supports specifying a locale client-side without JavaScript', async function () {
      const page: BasePage = await BasePage.initialize({ javaScriptEnabled: false, locale: 'ru-RU' })
      await page.goto('/')
      const lang = await page.getLanguage()
      await page.finalize()

      assert.equal(lang, 'ru')
    })

    it('supports specifying a locale via a "override-language" query parameter', async function () {
      const page: BasePage = await BasePage.initialize({ javaScriptEnabled: false })
      await page.goto('/?override-language=ru')
      const lang = await page.getLanguage()
      await page.finalize()

      assert.equal(lang, 'ru')
    })

    it('falls back to English on unrecognized locales specified client-side', async function () {
      const page: BasePage = await BasePage.initialize({ javaScriptEnabled: false, locale: 'bg-BG' })
      await page.goto('/')
      const lang = await page.getLanguage()
      await page.finalize()

      assert.equal(lang, 'en')
    })

    it("uses the browser's preferred locale with JavaScript enabled", async function () {
      const page: BasePage = await BasePage.initialize({ javaScriptEnabled: true, locale: 'ru-RU' })
      await page.goto('/')
      const lang = await page.getLanguage()
      await page.finalize()

      assert.equal(lang, 'ru')
    })

    it('supports specifying a locale via HTTP headers', async function () {
      const page: BasePage = await BasePage.initialize({ javaScriptEnabled: false, httpHeaders: { 'accept-language': 'ru-RU' } })
      await page.goto('/')
      const lang = await page.getLanguage()
      await page.finalize()

      assert.equal(lang, 'ru')
    })

    it('falls back to English on unrecognized locales specified via headers', async function () {
      const page: BasePage = await BasePage.initialize({ javaScriptEnabled: false, httpHeaders: { 'accept-language': 'bg-BG' } })
      await page.goto('/')
      const lang = await page.getLanguage()
      await page.finalize()

      assert.equal(lang, 'en')
    })

    it('supports specifying a color scheme via browser configuration', async function () {
      const page: BasePage = await BasePage.initialize({ javaScriptEnabled: false, colorScheme: 'dark' })
      await page.goto('/')
      const scheme = await page.getColorScheme()
      await page.finalize()

      assert.equal(scheme, 'dark')
    })

    it('falls back to a light scheme without browser configuration', async function () {
      const page: BasePage = await BasePage.initialize({ javaScriptEnabled: false })
      await page.goto('/')
      const scheme = await page.getColorScheme()
      await page.finalize()

      assert.equal(scheme, 'light')
    })

    it("uses the browser's preferred color scheme with JavaScript enabled", async function () {
      const page: BasePage = await BasePage.initialize({ javaScriptEnabled: true, colorScheme: 'dark' })
      await page.goto('/')
      const scheme = await page.getColorScheme()
      await page.finalize()

      assert.equal(scheme, 'dark')
    })
  })

  describe('without JavaScript', function () {
    let page: BasePage

    beforeEach(async function () {
      if (page) {
        await page.reset()
      } else {
        page = await BasePage.initialize({ javaScriptEnabled: false })
      }
    })

    after(async function () {
      await page?.finalize()
    })

    it('is shown on large screens', async function () {
      await page.goto('/')
      const mainMenu = page.getMainMenuLocator()
      assertTrue(await mainMenu.isVisible())
    })

    it('is hidden on small screens', async function () {
      await page.goto('/')
      await page.scaleViewport('Apple Watch')

      const mainMenu = page.getMainMenuLocator()
      assertFalse(await mainMenu.isVisible())
    })

    it('has a visible open button on small screens', async function () {
      await page.goto('/')
      await page.scaleViewport('Apple Watch')

      const openButton = page.getMainMenuOpenButton()
      const isToggleVisible = await openButton.isVisible()
      assertTrue(isToggleVisible)
    })

    it('panel is opened by the corresponding button on small screens', async function () {
      await page.goto('/')
      await page.scaleViewport('Apple Watch')

      const openButton = page.getMainMenuOpenButton()
      await openButton.click()

      const menuPanel = page.getMainMenuPanel()
      assertTrue(await menuPanel.isVisible())
    })

    it('panel is closed by the escape key on small screen', async function () {
      await page.goto('/')
      await page.scaleViewport('Apple Watch')

      const openButton = page.getMainMenuOpenButton()
      await openButton.click()
      await page.press('Escape')

      const menuPanel = page.getMainMenuPanel()
      assertFalse(await menuPanel.isVisible())
    })

    // playwright refuses to click the close button for whatever reason
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    it.skip('panel is closed by the close button on small screen', async function () {
      await page.goto('/')
      await page.scaleViewport('Apple Watch')

      const openButton = page.getMainMenuOpenButton()
      await openButton.click()

      const closeButton = page.getMainMenuCloseButton()
      await closeButton.click()

      const menuPanel = page.getMainMenuPanel()
      assertFalse(await menuPanel.isVisible())
    })

    it('has its language buttons disabled', async function () {
      await page.goto('/')
      const buttons = page.getMainMenuLanguageButtons()
      assertTrue(await buttons.en.isVisible())
      assertTrue(await buttons.ru.isDisabled())
    })

    it('has its color scheme toggle disabled', async function () {
      await page.goto('/')
      const button = page.getMainMenuColorLocator()
      assertTrue(await button.isDisabled())
    })

    it('has enabled anchors to other pages', async function () {
      await page.goto('/')
      const anchors = await page.getMainMenuAnchors()
      assert.equal(anchors.length, 4)

      assert.equal(await anchors[0].textContent(), 'Home page')
      assertTrue(await anchors[0].isEnabled())

      assert.equal(await anchors[1].textContent(), 'File explorer')
      assertTrue(await anchors[1].isEnabled())

      assert.equal(await anchors[2].textContent(), 'Pacman repo')
      assertTrue(await anchors[2].isEnabled())

      assert.equal(await anchors[3].textContent(), 'Playground')
      assertTrue(await anchors[3].isEnabled())
    })
  })

  describe('with JavaScript', function () {
    let page: BasePage

    beforeEach(async function () {
      if (page) {
        await page.reset()
      } else {
        page = await BasePage.initialize({ javaScriptEnabled: true })
      }
    })

    after(async function () {
      await page?.finalize()
    })

    describe('languages', function () {
      it('supports specifying a locale via a "override-language" query parameter', async function () {
        await page.goto('/?override-language=ru')
        const lang = await page.getLanguage()

        assert.equal(lang, 'ru')
      })

      it('main menu has its language buttons enabled', async function () {
        await page.goto('/')
        const buttons = page.getMainMenuLanguageButtons()

        assertTrue(await buttons.en.isEnabled())
        assertTrue(await buttons.ru.isEnabled())
      })

      it('switches to Russian after clicking Русский', async function () {
        await page.goto('/')
        const buttons = page.getMainMenuLanguageButtons()
        await buttons.ru.click({ expectLoadingIndicator: true })
        const lang = await page.getLanguage()
        assert.equal(lang, 'ru')
      })

      it('switches to English after clicking Русский and then English', async function () {
        await page.goto('/')
        const buttons = page.getMainMenuLanguageButtons()
        await buttons.ru.click({ expectLoadingIndicator: true })
        await buttons.en.click()
        const lang = await page.getLanguage()
        assert.equal(lang, 'en')
      })
    })

    describe('color scheme', function () {
      it('main menu has its scheme toggle button enabled', async function () {
        await page.goto('/')
        const button = page.getMainMenuColorLocator()
        assertTrue(await button.isEnabled())
      })

      it('uses a light scheme by default', async function () {
        await page.goto('/')
        const scheme = await page.getColorScheme()
        assert.equal(scheme, 'light')
      })

      it('changes to a dark scheme after clicking the toggle', async function () {
        await page.goto('/')
        const button = page.getMainMenuColorLocator()
        await button.click()
        const scheme = await page.getColorScheme()
        assert.equal(scheme, 'dark')
      })

      it('changes back to a light scheme after clicking the toggle twice', async function () {
        await page.goto('/')
        const button = page.getMainMenuColorLocator()
        await button.click()
        await button.click()
        const scheme = await page.getColorScheme()
        assert.equal(scheme, 'light')
      })
    })
  })
})
