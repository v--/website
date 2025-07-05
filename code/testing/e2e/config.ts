import { chromium, firefox, webkit } from '@playwright/test'

export const BASE_URL = process.env['E2E_ENVIRONMENT'] === 'production' ?
  'https://ivasilev.net' :
  'http://localhost:3000'

export const JAVASCRIPT_OPTIONS = [
  { javaScriptEnabled: false, label: 'without JavaScript' },
  { javaScriptEnabled: true, label: 'with JavaScript' },
]

function getBrowser(name?: string) {
  switch (name) {
    case 'firefox':
      return firefox
    case 'webkit':
      return webkit
    default:
      return chromium
  }
}

export const BROWSER = getBrowser(process.env['E2E_BROWSER'])
