// Only show the loading indicator if JavaScript is enabled.
// This precise HTML element will get replaced by a new one on the first client-side render,
// so there is technically no need to even dismiss it.
const indicator = document.getElementById('loading-indicator')

if (indicator instanceof HTMLElement) {
  indicator.showPopover()
}
