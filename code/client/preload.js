// Set compatibility status
const availableFeatures = {}

availableFeatures.asyncIteration = window.Symbol !== undefined && window.Object.prototype.hasOwnProperty.call(Symbol, 'asyncIterator')
// I couldn't find a way to easily test ES6 module compatibility, so I test for async iteration that was made available at roughly the same time
availableFeatures.modules = availableFeatures.asyncIteration

window.DESKTOP_WIDTH = 700
window.CORE_COMPATIBILITY = availableFeatures.modules
window.PLAYGROUND_COMPATIBILITY = {
  sorting: availableFeatures.modules,
  curve_fitting: availableFeatures.modules,
  resolution: availableFeatures.modules,
  breakout: availableFeatures.modules,
  graphs: availableFeatures.modules
}

// Now do some hackish DOM initialization to avoid "flashing" when to main code kicks in
const path = window.location.pathname.split('/').slice(1)

function onLoad () {
  // Hide images so that they get reloaded upon rerendering
  for (const img of document.querySelectorAll('img')) {
    img.style.visibility = 'hidden'
  }

  if (window.innerWidth < window.DESKTOP_WIDTH) {
    const sidebar = document.querySelector('aside')
    // Avoid using the "collapsed" class to prevent animations
    sidebar.style.display = 'none'
  }

  if (path[0] === 'playground' && window.PLAYGROUND_COMPATIBILITY[path[1]]) {
    const indicator = document.querySelector('.loading-indicator-wrapper')
    indicator.style.backgroundColor = 'white'
    indicator.style.visibility = 'visible'
  }
}

function onAnimationFrame () {
  if (document.body) {
    onLoad()
  } else {
    window.requestAnimationFrame(onAnimationFrame)
  }
}

if (window.CORE_COMPATIBILITY) {
  // DOMContentLoaded and load kick in too late to use here
  window.requestAnimationFrame(onAnimationFrame)
}
