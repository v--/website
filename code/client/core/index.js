/* eslint-env browser */

const { redirection } = require('common/observables')
const { c } = require('common/component')

const main = require('common/components/main')
const title = require('common/components/title')

const RouterObservable = require('client/core/support/router_observable')
const render = require('client/core/render')

window.COMPATIBLE_INTERPRETER = Object.hasOwnProperty('assign')

function onDocumentReady() {
    if (!window.COMPATIBLE_INTERPRETER)
        return new Promise(function () {})

    if (document.readyState === 'complete')
        return Promise.resolve()

    return new Promise(function (resolve) {
        function listener() {
            window.removeEventListener('DOMContentLoaded', listener)
            resolve()
        }

        window.addEventListener('DOMContentLoaded', listener)
    })
}

onDocumentReady().then(async function () {
    const state = await RouterObservable.create(document.location.pathname)

    redirection.subscribe({
        next(value) {
            state.changeURL(value)
        },

        error(err) {
            state.error(err)
        },

        complete() {
            state.complete()
        }
    })

    document.body.replaceChild(
        render(c(main, state)),
        document.querySelector('main')
    )

    document.head.replaceChild(
        render(c(title, state)),
        document.querySelector('title')
    )
})
