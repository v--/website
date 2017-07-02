/* eslint-env browser */

const home = require('common/views/home')

const render = require('client/core/render')
const { onDocumentReady } = require('client/core/support/domtools')

onDocumentReady().then(async function () {
    const component = home.component()
    const rendered = render(component)

    const main = document.querySelector('main')
    main.replaceChild(rendered, main.firstChild)
})
