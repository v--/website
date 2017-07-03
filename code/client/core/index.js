/* eslint-env browser */

const { splitURL } = require('common/support/strtools')
const router = require('common/router')
const head = require('common/components/head')
const body = require('common/components/body')
const { c } = require('common/component')

const { onDocumentReady } = require('client/core/support/domtools')
const render = require('client/core/render')
const db = require('client/core/db')

onDocumentReady().then(async function () {
    const parsedURL = splitURL(document.location.pathname)
    const headComponent = c(head, parsedURL)
    const bodyComponent = c(body, parsedURL, await router(db, parsedURL))
    const html = document.querySelector('html')
    html.replaceChild(render(headComponent), html.firstChild)
    html.replaceChild(render(bodyComponent), html.lastChild)
})
