/* eslint-env browser */

window.COMPATIBLE_INTERPRETER = Object.hasOwnProperty('assign')
var isInteractive = new RegExp('^/playground/').test(location.pathname)

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

if (!window.COMPATIBLE_INTERPRETER) {
  window.addEventListener('DOMContentLoaded', showError)
} else if (isInteractive) {
  // DOMContentLoaded and load were simply too slow here
  var interval = setInterval(function () {
    if (document.body) {
      showLoading()
      clearInterval(interval)
    }
  }, 10)
}
