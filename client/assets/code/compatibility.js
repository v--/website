/* eslint-env browser */

function showError() {
    const nojs = document.querySelector('.nojs')
    const div = document.createElement('div')
    const span = document.createElement('span')

    div.appendChild(span)

    div.setAttribute('class', 'nojs')
    span.setAttribute('class', 'content')
    span.textContent = nojs.textContent

    nojs.parentNode.replaceChild(div, nojs)
}

if (!window.COMPATIBLE_INTERPRETER)
    window.addEventListener('load', showError)
