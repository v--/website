import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getPaginatorBounds } from './pagination.ts'

describe('getPaginatorBounds function', function () {
  // This is a default parameter, but for the sake of unit testing we want it to be fixed
  const PAGE_RADIUS = 4

  describe('for only one page', function () {
    it('keeps the [1, 1] interval', function () {
      const bounds = getPaginatorBounds(0, 1, PAGE_RADIUS)
      assert.deepEqual(bounds, { lower: 0, upper: 0 })
    })
  })

  describe('for only a few pages', function () {
    const PAGE_COUNT = PAGE_RADIUS - 1

    it('keeps the full range on the first page', function () {
      const bounds = getPaginatorBounds(0, PAGE_COUNT, PAGE_RADIUS)
      assert.deepEqual(bounds, { lower: 0, upper: PAGE_COUNT - 1 })
    })

    it('keeps the full range on the last page', function () {
      const bounds = getPaginatorBounds(PAGE_COUNT - 1, PAGE_COUNT, PAGE_RADIUS)
      assert.deepEqual(bounds, { lower: 0, upper: PAGE_COUNT - 1 })
    })
  })

  describe('for many pages', function () {
    const PAGE_COUNT = 20
    const DIAMETER = 2 * PAGE_RADIUS

    it('expands as much as possible to the right on the first page', function () {
      const bounds = getPaginatorBounds(0, PAGE_COUNT, PAGE_RADIUS)
      assert.deepEqual(bounds, { lower: 0, upper: DIAMETER })
    })

    it('expands as much as possible to the right on a page less than the radius', function () {
      const bounds = getPaginatorBounds(PAGE_RADIUS - 1, PAGE_COUNT, PAGE_RADIUS)
      assert.deepEqual(bounds, { lower: 0, upper: DIAMETER })
    })

    it('shifts when the current page exceeds the radius', function () {
      const bounds = getPaginatorBounds(PAGE_RADIUS + 1, PAGE_COUNT, PAGE_RADIUS)
      assert.deepEqual(bounds, { lower: 1, upper: DIAMETER + 1 })
    })

    it('expands as much as possible to the left on the last page', function () {
      const bounds = getPaginatorBounds(PAGE_COUNT - 1, PAGE_COUNT, PAGE_RADIUS)
      assert.deepEqual(bounds, { lower: PAGE_COUNT - DIAMETER, upper: PAGE_COUNT - 1 })
    })

    it('centers itself on a page in the middle', function () {
      const center = Math.floor(PAGE_COUNT / 2)
      const bounds = getPaginatorBounds(center, PAGE_COUNT, PAGE_RADIUS)
      assert.deepEqual(bounds, { lower: center - PAGE_RADIUS, upper: center + PAGE_RADIUS })
    })
  })
})
