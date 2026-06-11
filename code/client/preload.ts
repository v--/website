// Only show the loading indicator if JavaScript is enabled.
// This precise HTML element will get replaced by a new one on the first client-side render,
// so there is technically no need to even dismiss it.
const indicator = document.getElementById('loading-indicator')

if (indicator instanceof HTMLElement) {
  indicator.showPopover()
}

// Enable the loading text on the placeholder page.
// The text is by default hidden so that, if JavaScript is not enabled, only the noscript section gets shown.
const placeholderLoadingText = document.querySelector('.placeholder-page-loading')

if (placeholderLoadingText instanceof HTMLElement) {
  placeholderLoadingText.style.display = 'revert'
}

// Polyfill for https://github.com/tc39/proposal-explicit-resource-management
// V8 and SpiderMonkey provide support as of 2025, but JavaScriptCore does not as of mid-2026.
if (Symbol.dispose === undefined) {
  (Symbol.dispose as unknown) = Symbol('@@dispose')
}

if (Symbol.asyncDispose === undefined) {
  (Symbol.asyncDispose as unknown) = Symbol('@@asyncDispose')
}
