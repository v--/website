/* eslint-disable no-inner-declarations */

{
  // Set compatibility status
  const availableFeatures = {
    // I couldn't find a way to easily test ES6 module compatibility, so I test for async iteration that was made available at roughly the same time
    // Note that this check was written in 2017, but I don't want to remove it to avoid unconventional browsers.
    modules: window.Symbol !== undefined && window.Object.prototype.hasOwnProperty.call(Symbol, 'asyncIterator')
  }

  // Only these properties are really important, the rest is "initializing elements prior to the code kicking in so that nothing flickers".
  window.DESKTOP_WIDTH = 800 // See also $mobile-width in styles/_sizes.scss
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

  function safeQuerySelector(query: string): HTMLElement {
    const element = document.querySelector(query)

    if (element === null) {
      // eslint-disable-next-line no-restricted-syntax
      throw new Error(`Cannot find an element satisfying ${query}.`)
    }

    return element as HTMLElement
  }

  function initializePage() {
    if (window.innerWidth < window.DESKTOP_WIDTH) {
      // Avoid using the "collapsed" class to prevent animations
      const sidebar = safeQuerySelector('aside')
      sidebar.style.display = 'none'
    }

    if (path[0] === 'playground' && window.PLAYGROUND_COMPATIBILITY[path[1]]) {
      const indicator = safeQuerySelector('.loading-indicator-wrapper')
      indicator.style.backgroundColor = 'white'
      indicator.style.visibility = 'visible'
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      safeQuerySelector('main').className = 'dark-scheme'
      safeQuerySelector('.toggle-scheme-button > .entry-text').textContent = 'Light scheme'
    }
  }

  function onAnimationFrame() {
    if (document.body) {
      try {
        initializePage()
      } catch (err) {
        // Log an error but don't crash
        console.error('Initialization error; continuing nonetheless...')
        console.error(err)
      }
    } else {
      window.requestAnimationFrame(onAnimationFrame)
    }
  }

  if (window.CORE_COMPATIBILITY) {
    // The "DOMContentLoaded" and "load" events kick in too late to use here
    window.requestAnimationFrame(onAnimationFrame)
  }
}
