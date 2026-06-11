/**
 * This is a hack to load BrowserSync only after the initial client-side render.
 * BrowserSync works with the document body. We replace the body during the
 * initial render, so things break if using the usual loading mechanism.
 *
 * Even if I implement component rehydration at some point, I will need BrowserSync
 * to wait until all renderers are bound to their respective DOM elements and fix any
 * virtual/real DOM discrepancies.
 *
 * We wait for the initial render to finish and only then inject the BrowserSync script.
 */

const SLEEP_DURATION_MS = 100
const BROWSER_SYNC_SCRIPT = '/browser-sync/browser-sync-client.js'

function injectBrowserSync() {
  const scriptElement = document.createElement('script')
  scriptElement.setAttribute('src', BROWSER_SYNC_SCRIPT)
  document.head.append(scriptElement)
}

function scheduleBrowserSyncInjection() {
  if (document.body.classList.contains('dynamic-content')) {
    injectBrowserSync()
  } else {
    setTimeout(scheduleBrowserSyncInjection, SLEEP_DURATION_MS)
  }
}

scheduleBrowserSyncInjection()
