window.DESKTOP_WIDTH = 700

var isPageInteractive = new RegExp('^/playground/').test(window.location.pathname)
var isInterpreterCompatible = Symbol.hasOwnProperty('asyncIterator')

function onLoad () {
  if (window.innerWidth < window.DESKTOP_WIDTH) {
    var sidebar = document.querySelector('aside')
    // Avoid using the "collapsed" class to prevent animations
    sidebar.style.display = 'none'
  }

  if (isPageInteractive) {
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

if (isInterpreterCompatible) {
  // DOMContentLoaded and load kick in too late to use here
  window.requestAnimationFrame(onAnimationFrame)
}
