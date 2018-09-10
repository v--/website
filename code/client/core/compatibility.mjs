window.COMPATIBLE_INTERPRETER = Object.hasOwnProperty('assign')
window.DESKTOP_WIDTH = 700

var isPageInteractive = new RegExp('^/playground/').test(window.location.pathname)

function showError () {
  var nojs = document.querySelector('.nojs')
  var div = document.createElement('div')
  var span = document.createElement('span')

  div.appendChild(span)

  div.setAttribute('class', 'nojs')
  span.setAttribute('class', 'content')
  span.textContent = nojs.textContent

  nojs.parentNode.replaceChild(div, nojs)
}

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

if (!window.COMPATIBLE_INTERPRETER) {
  window.addEventListener('DOMContentLoaded', showError)
} else {
  // DOMContentLoaded and load kick in too late to use here
  window.requestAnimationFrame(onAnimationFrame)
}
