// Set compatibility status
window.DESKTOP_WIDTH = 700
window.CORE_COMPATIBILITY = Symbol.hasOwnProperty('iterator')
window.PLAYGROUND_COMPATIBILITY = {
  sorting: window.CORE_COMPATIBILITY,
  curve_fitting: window.CORE_COMPATIBILITY
}

// Now do some hackish DOM initialization to avoid "flashing" when to main code kicks in
var path = window.location.pathname.split('/').slice(1)

function onLoad () {
  if (window.innerWidth < window.DESKTOP_WIDTH) {
    var sidebar = document.querySelector('aside')
    // Avoid using the "collapsed" class to prevent animations
    sidebar.style.display = 'none'
  }

  if (path[0] === 'playground' && window.PLAYGROUND_COMPATIBILITY[path[1]]) {
    var indicator = document.querySelector('.loading-indicator-wrapper')
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
