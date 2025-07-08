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

    it('exists', async function () {
      await page.goto('/')
      assertTrue(await page.hasSidebar())
    })

    it('has its collapse button disabled', async function () {
      await page.goto('/')
      const button = page.getSidebarCollapseLocator()
      assertTrue(await button.isDisabled())
    })

    it('has its language buttons disabled', async function () {
      await page.goto('/')
      const buttons = page.getSidebarLanguageButtons()

      assertTrue(await buttons.en.isDisabled())
      assertTrue(await buttons.ru.isDisabled())
    })

    it('has its color scheme toggle disabled', async function () {
      await page.goto('/')
      const button = page.getSidebarColorLocator()
      assertTrue(await button.isDisabled())
    })

    it('has enabled anchors to other pages', async function () {
      await page.goto('/')
      const anchors = await page.getSidebarAnchors()
      assert.equal(anchors.length, 4)

      assert.equal(await anchors[0].textContent(), 'Home page')
      assertTrue(await anchors[0].isEnabled())

      assert.equal(await anchors[1].textContent(), 'File server')
      assertTrue(await anchors[1].isEnabled())

      assert.equal(await anchors[2].textContent(), 'Pacman repo')
      assertTrue(await anchors[2].isEnabled())

      assert.equal(await anchors[3].textContent(), 'Playground')
      assertTrue(await anchors[3].isEnabled())
    })

    it('is expanded by default', async function () {
      await page.goto('/')
      const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
      assertFalse(isSidebarActuallyCollapsed)
    })

    it('collapses on small screens', async function () {
      await page.goto('/')
      await page.scaleViewport('VGA')

      const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
      assertTrue(isSidebarActuallyCollapsed)
    })

    it('expands when enlarging a small screen', async function () {
      await page.goto('/')
      await page.scaleViewport('VGA')
      await page.scaleViewport('Full HD')

      const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
      assertFalse(isSidebarActuallyCollapsed)
    })

    it('collapses when shrinking a large screen', async function () {
      await page.goto('/')
      await page.scaleViewport('Full HD')
      await page.scaleViewport('VGA')

      const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
      assertTrue(isSidebarActuallyCollapsed)
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

    describe('sidebar', function () {
      it('exists', async function () {
        await page.goto('/')
        assertTrue(await page.hasSidebar())
      })

      it('has its collapse button enabled', async function () {
        await page.goto('/')
        const button = page.getSidebarCollapseLocator()
        assertTrue(await button.isEnabled())
      })

      it('is expanded by default', async function () {
        await page.goto('/')
        const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
        assertFalse(isSidebarActuallyCollapsed)
      })

      it('collapses on small screens', async function () {
        await page.goto('/')
        await page.scaleViewport('VGA')

        const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
        assertTrue(isSidebarActuallyCollapsed)
      })

      it('collapses on large screens when the collapse button is clicked', async function () {
        await page.goto('/')
        await page.scaleViewport('Full HD')

        const button = page.getSidebarCollapseLocator()
        await button.click()

        const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
        assertTrue(isSidebarActuallyCollapsed)
      })

      it('is expanded after clicking the collapse button twice on a large screen', async function () {
        await page.goto('/')
        await page.scaleViewport('Full HD')

        const button = page.getSidebarCollapseLocator()
        await button.click()
        await button.click()

        await page.scaleViewport('Full HD')

        const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
        assertFalse(isSidebarActuallyCollapsed)
      })

      it('expands on small screens when the collapse button is clicked', async function () {
        await page.goto('/')
        await page.scaleViewport('VGA')

        const button = page.getSidebarCollapseLocator()
        await button.click()

        const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
        assertFalse(isSidebarActuallyCollapsed)
      })

      it('is collapsed after clicking the collapse button twice on a large screen', async function () {
        await page.goto('/')
        await page.scaleViewport('Full HD')

        const button = page.getSidebarCollapseLocator()
        await button.click()
        await button.click()

        await page.scaleViewport('Full HD')

        const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
        assertFalse(isSidebarActuallyCollapsed)
      })

      it('expands when enlarging a small screen', async function () {
        await page.goto('/')
        await page.scaleViewport('VGA')
        await page.scaleViewport('Full HD')

        const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
        assertFalse(isSidebarActuallyCollapsed)
      })

      it('is collapsed when enlarging a small screen after clicking the collapse button twice', async function () {
        await page.goto('/')
        await page.scaleViewport('VGA')

        const button = page.getSidebarCollapseLocator()
        await button.click()
        await button.click()

        await page.scaleViewport('Full HD')

        const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
        assertTrue(isSidebarActuallyCollapsed)
      })

      it('collapses when shrinking a large screen', async function () {
        await page.goto('/')
        await page.scaleViewport('Full HD')
        await page.scaleViewport('VGA')

        const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
        assertTrue(isSidebarActuallyCollapsed)
      })

      it('is expanded when shrinking a large screen after clicking the collapse button twice', async function () {
        await page.goto('/')
        await page.scaleViewport('Full HD')

        const button = page.getSidebarCollapseLocator()
        await button.click()
        await button.click()

        await page.scaleViewport('VGA')

        const isSidebarActuallyCollapsed = await page.isSidebarActuallyCollapsed()
        assertFalse(isSidebarActuallyCollapsed)
      })
    })

    describe('languages', function () {
      it('supports specifying a locale via a "override-language" query parameter', async function () {
        await page.goto('/?override-language=ru')
        const lang = await page.getLanguage()

        assert.equal(lang, 'ru')
      })

      it('sidebar has its language buttons enabled', async function () {
        await page.goto('/')
        const buttons = page.getSidebarLanguageButtons()

        assertTrue(await buttons.en.isEnabled())
        assertTrue(await buttons.ru.isEnabled())
      })

      it('switches to Russian after clicking РУС', async function () {
        await page.goto('/')
        const buttons = page.getSidebarLanguageButtons()
        await buttons.ru.click({ expectLoadingIndicator: true })
        const lang = await page.getLanguage()
        assert.equal(lang, 'ru')
      })

      it('switches to English after clicking РУС and then ENG', async function () {
        await page.goto('/')
        const buttons = page.getSidebarLanguageButtons()
        await buttons.ru.click({ expectLoadingIndicator: true })
        await buttons.en.click()
        const lang = await page.getLanguage()
        assert.equal(lang, 'en')
      })
    })

    describe('color scheme', function () {
      it('sidebar has its scheme toggle button enabled', async function () {
        await page.goto('/')
        const button = page.getSidebarColorLocator()
        assertTrue(await button.isEnabled())
      })

      it('uses a light scheme by default', async function () {
        await page.goto('/')
        const scheme = await page.getColorScheme()
        assert.equal(scheme, 'light')
      })

      it('changes to a dark scheme after clicking the toggle', async function () {
        await page.goto('/')
        const button = page.getSidebarColorLocator()
        await button.click()
        const scheme = await page.getColorScheme()
        assert.equal(scheme, 'dark')
      })

      it('changes back to a light scheme after clicking the toggle twice', async function () {
        await page.goto('/')
        const button = page.getSidebarColorLocator()
        await button.click()
        await button.click()
        const scheme = await page.getColorScheme()
        assert.equal(scheme, 'light')
      })
    })
  })
})
