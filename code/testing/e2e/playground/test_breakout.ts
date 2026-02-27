import assert from 'node:assert/strict'
import { after, beforeEach, describe, it } from 'node:test'

import { assertFalse, assertGreaterThan, assertTrue } from '../../assertion.ts'
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

    assert.equal(title, "Breakout ⋅ Playground ⋅ Ianis Vasilev's website")
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

            assertTrue(arBox.width > 0)
            assertTrue(arBox.height > 0)
            assertTrue(pcBox.fits(arBox))
          })
        }
      }
    })

    describe('menu', function () {
      it('is expanded on a large screen', async function () {
        await page.scaleViewport('Full HD')
        await page.goto('/playground/breakout')
        await waitForStableState(page.getMenuRestLocator())
        assertTrue(await page.isMenuExpanded())
      })

      it('is collapsed on a medium screen', async function () {
        await page.scaleViewport('VGA')
        await page.goto('/playground/breakout')
        await waitForStableState(page.getMenuRestLocator())
        assertFalse(await page.isMenuExpanded())
      })

      it('can expand on a medium screen by clicking the menu toggle', async function () {
        await page.scaleViewport('VGA')
        await page.goto('/playground/breakout')
        const toggle = page.getMenuToggleButton()
        await toggle.click()
        await waitForStableState(page.getMenuRestLocator())
        assertTrue(await page.isMenuExpanded())
      })

      it('can collapse by clicking the menu toggle twice', async function () {
        await page.scaleViewport('VGA')
        await page.goto('/playground/breakout')
        const toggle = page.getMenuToggleButton()
        await toggle.click()
        await waitForStableState(page.getMenuRestLocator())
        await toggle.click()
        await waitForStableState(page.getMenuRestLocator())
        assertFalse(await page.isMenuExpanded())
      })
    })

    describe('debug trace', function () {
      it('are hidden by default', async function () {
        await page.goto('/playground/breakout')
        const balls = await page.getGhostBallLocators()
        assert.equal(balls.length, 0)
      })

      it('are shown when debug mode is toggled', async function () {
        await page.goto('/playground/breakout')
        const stage = page.getStageLocator()
        const debugToggle = page.getDebugToggle()
        await debugToggle.click()
        await waitForStableState(stage)
        const balls = await page.getGhostBallLocators()
        assertGreaterThan(balls.length, 0)
      })

      it('are hidden when debug mode is toggled twice', async function () {
        await page.goto('/playground/breakout')
        const stage = page.getStageLocator()
        const debugToggle = page.getDebugToggle()
        await debugToggle.click()
        await waitForStableState(stage)
        await debugToggle.click()
        await waitForStableState(stage)
        const balls = await page.getGhostBallLocators()
        assert.equal(balls.length, 0)
      })
    })
  })
})
