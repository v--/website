import { type BrowserType, chromium, firefox, webkit } from '@playwright/test'

import { extractCommandLineOption } from './options.ts'
import { type uint32 } from '../../common/types/numbers.ts'

export const TEST_BROWSERS = ['firefox', 'chromium', 'webkit'] as const
export type TestBrowser = typeof TEST_BROWSERS[uint32]

export function getTestBrowser(argv: string[]): TestBrowser {
  return extractCommandLineOption('browser', TEST_BROWSERS, argv)
}

export function getBrowser(env: TestBrowser): BrowserType {
  switch (env) {
    case 'chromium':
      return chromium

    case 'firefox':
      return firefox

    case 'webkit':
      return webkit
  }
}
