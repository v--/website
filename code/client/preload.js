/* eslint-disable no-inner-declarations */

{
  // Set compatibility status
  const availableFeatures = {
    // I couldn't find a way to easily test ES6 module compatibility, so I test for async iteration that was made available at roughly the same time
    modules: window.Symbol !== undefined && window.Object.prototype.hasOwnProperty.call(Symbol, 'asyncIterator')
  }

  window.DESKTOP_WIDTH = 800
  window.CORE_COMPATIBILITY = availableFeatures.modules
  window.PLAYGROUND_COMPATIBILITY = {
    array_sorting: availableFeatures.modules,
    curve_fitting: availableFeatures.modules,
    first_order_resolution: availableFeatures.modules,
    breakout: availableFeatures.modules,
    fleeing_button: availableFeatures.modules
  }

  // Now do some hackish DOM initialization to avoid "flashing" when the main code kicks in
  const path = window.location.pathname.split('/').slice(1)

  /**
   * Cast the result of document.querySelector to an HTMLElement
   * @param {string} query
   * @returns {HTMLElement}
   */
  function querySelector(query) {
    return /** @type {HTMLElement} */ (document.querySelector(query))
  }

  function onLoad() {
    if (window.innerWidth < window.DESKTOP_WIDTH) {
      const sidebar = querySelector('aside')
      // Avoid using the "collapsed" class to prevent animations
      sidebar.style.display = 'none'
    }

    if (path[0] === 'playground' && window.PLAYGROUND_COMPATIBILITY[path[1]]) {
      const indicator = querySelector('.loading-indicator-wrapper')
      indicator.style.backgroundColor = 'white'
      indicator.style.visibility = 'visible'
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      querySelector('main').className = 'dark-scheme'
      querySelector('.toggle-scheme-button > .entry-text').textContent = 'Light scheme'
    }
  }

  function onAnimationFrame() {
    if (document.body) {
      onLoad()
    } else {
      window.requestAnimationFrame(onAnimationFrame)
    }
  }

  if (window.CORE_COMPATIBILITY) {
    // The "DOMContentLoaded" and "load" events kick in too late to use here
    window.requestAnimationFrame(onAnimationFrame)
  }
}
