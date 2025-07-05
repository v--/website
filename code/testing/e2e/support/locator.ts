import { AssertionError } from 'node:assert/strict'

import { type Locator } from '@playwright/test'

import { AARect } from '../../../common/math/geom2d.ts'
import { repr } from '../../../common/support/strings.ts'
import { type SortDirection } from '../../../common/types/table_interaction.ts'

export async function getLocatorClasses(locator: Locator) {
  const classes = await locator.getAttribute('class')
  return classes ? classes.split(' ') : []
}

export async function getBoundingBox(locator: Locator) {
  const bbox = await locator.boundingBox()

  if (bbox === null) {
    throw new AssertionError({
      message: `Expected the aspect ratio box for ${repr(locator)} to be non-null`,
    })
  }

  return new AARect(bbox)
}

export async function getSortingDirection(locator: Locator): Promise<SortDirection> {
  const ariaSort = await locator.getAttribute('aria-sort')

  switch (ariaSort) {
    case 'ascending':
      return 'asc'
    case 'descending':
      return 'desc'
    default:
      return 'neutral'
  }
}

/**
 * As per https://playwright.dev/docs/actionability#stable,
 * "Element is considered stable when it has maintained the same bounding box for at least two consecutive animation frames."
 *
 * PlayWright offers checking for stability only via "element handles", which are not recommended.
 *
 * See https://github.com/microsoft/playwright/issues/15195
 */
export async function waitForStableState(locator: Locator) {
  const handle = await locator.elementHandle()
  await handle?.waitForElementState('stable')
}
