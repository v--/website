import { getBrowser, getTestBrowser } from '../cli/browser.ts'
import { getBaseEnvironmentUrl, getTestEnvironment } from '../cli/env.ts'

export const JAVASCRIPT_OPTIONS = [
  { javaScriptEnabled: false, label: 'without JavaScript' },
  { javaScriptEnabled: true, label: 'with JavaScript' },
]

export const BASE_URL = getBaseEnvironmentUrl(getTestEnvironment(process.argv))
export const BROWSER = getBrowser(getTestBrowser(process.argv))
