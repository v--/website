/* eslint-env browser */

window.COMPATIBLE_INTERPRETER = Object.hasOwnProperty('assign')
window.DESKTOP_WIDTH = 700

var isPageInteractive = new RegExp('^/playground/').test(location.pathname)

function showError () {
  const nojs = document.querySelector('.nojs')
  const div = document.createElement('div')
  const span = document.createElement('span')

  div.appendChild(span)

  div.setAttribute('class', 'nojs')
  span.setAttribute('class', 'content')
  span.textContent = nojs.textContent

  nojs.parentNode.replaceChild(div, nojs)
}

function showLoading () {
  const indicator = document.querySelector('.loading-indicator-wrapper')
  indicator.style.backgroundColor = 'white'
  indicator.style.visibility = 'visible'
}

function hideSidebar () {
  const sidebar = document.querySelector('aside')
  // Avoid using the "collapsed" class to prevent animations
  sidebar.style.display = 'none'
}

if (!window.COMPATIBLE_INTERPRETER) {
  window.addEventListener('DOMContentLoaded', showError)
} else {
  // DOMContentLoaded and load are simply too late to use here
  var interval = window.setInterval(function () {
    if (!document.body) {
      return
    }

    window.clearInterval(interval)

    if (window.innerWidth < window.DESKTOP_WIDTH) {
      hideSidebar()
    }

    if (isPageInteractive) {
      showLoading()
    }
  }, 10)
}
