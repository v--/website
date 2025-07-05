import assert from 'node:assert/strict'
import { after, beforeEach, describe, it } from 'node:test'

import { assertFalse, assertTrue } from '../../assertion.ts'
import { BreakoutPage } from '../playground/breakout.ts'
import { getBoundingBox, waitForStableState } from '../support/locator.ts'
import { VIEWPORT_SIZE_NAMES } from '../support/viewport.ts'

describe('Breakout page', function () {
  it('without JavaScript shows a fallback page with an unsupported message', async function () {
    const page: BreakoutPage = await BreakoutPage.initialize({ javaScriptEnabled: false })
    await page.goto('/playground/breakout')

    const title = await page.getTitle()
    const isAtPlaceholder = await page.isAtPlaceholder()
    const showsUnsupportedMessage = await page.showsUnsupportedMessage()

    await page.finalize()

    assert.equal(title, 'Breakout | ivasilev.net')
    assertTrue(isAtPlaceholder)
    assertTrue(showsUnsupportedMessage)
  })

  describe('with JavaScript', function () {
    let page: BreakoutPage

    beforeEach(async function () {
      if (page) {
        await page.reset()
      } else {
        page = await BreakoutPage.initialize({ javaScriptEnabled: true })
      }
    })

    after(async function () {
      await page?.finalize()
    })

    describe('aspect ratio box', function () {
      for (const sizeName of VIEWPORT_SIZE_NAMES) {
        for (const orientation of ['vertical', 'horizontal']) {
          it(`is nonempty and fits the screen on ${orientation} ${sizeName}`, async function () {
            await page.scaleViewport(sizeName, { vertical: orientation === 'vertical' })
            await page.goto('/playground/breakout')
            const pcBox = await getBoundingBox(page.getPageContainerLocator())
            const arBox = await getBoundingBox(page.getAspectRatioBoxLocator())

            assertTrue(arBox.getArea() > 0)
            assertTrue(pcBox.fits(arBox))
          })
        }
      }
    })

    describe('menu', function () {
      it('is expanded on a large screen', async function () {
        await page.scaleViewport('Full HD')
        await page.goto('/playground/breakout')
        assertFalse(await page.isMenuExpanded())
      })

      it('is collapsed on a small screen', async function () {
        await page.scaleViewport('VGA')
        await page.goto('/playground/breakout')
        assertTrue(await page.isMenuExpanded())
      })

      it('can expand on a small screen by clicking the menu toggle', async function () {
        await page.scaleViewport('VGA')
        await page.goto('/playground/breakout')
        const rest = page.getMenuRest()
        const toggle = page.getMenuToggleLocator()
        await toggle.click()
        await waitForStableState(rest)
        const reset = page.getResetButtonLocator()
        assertTrue(await reset.isVisible())
      })

      it('can collapse by clicking the menu toggle twice', async function () {
        await page.scaleViewport('VGA')
        await page.goto('/playground/breakout')
        const rest = page.getMenuRest()
        const toggle = page.getMenuToggleLocator()
        await toggle.click()
        await waitForStableState(rest)
        await toggle.click()
        await waitForStableState(rest)
        const reset = page.getResetButtonLocator()
        assertFalse(await reset.isVisible())
      })
    })
  })
})
