/* eslint-env browser */

function showError() {
    const nojs = document.querySelector('.nojs')
    const div = document.createElement('div')
    div.setAttribute('class', 'nojs')
    div.textContent = nojs.textContent
    nojs.parentNode.replaceChild(div, nojs)
}

if (!window.COMPATIBLE_INTERPRETER)
    window.addEventListener('load', showError)
