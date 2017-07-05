/* eslint-env browser */

const { c } = require('common/component')

const body = require('common/components/body')
const title = require('common/components/title')

const { onDocumentReady } = require('client/core/support/domtools')
const RouterObservable = require('client/core/support/router_observable')
const render = require('client/core/render')

onDocumentReady().then(async function () {
    const state = await RouterObservable.create(document.location.pathname)

    document.querySelector('html').replaceChild(
        render(c(body, state)),
        document.body
    )

    document.head.replaceChild(
        render(c(title, state)),
        document.querySelector('title')
    )
})
