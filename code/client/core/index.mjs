/* eslint-env browser */

import { redirection } from '../../common/observables'
import { c } from '../../common/component'

import main from '../../common/components/main'
import title from '../../common/components/title'

import RouterObservable from '../../client/core/support/router_observable'
import render from './render'

window.COMPATIBLE_INTERPRETER = Object.hasOwnProperty('assign')

function onDocumentReady () {
  if (!window.COMPATIBLE_INTERPRETER) { return new Promise(function () {}) }

  if (document.readyState === 'complete') { return Promise.resolve() }

  return new Promise(function (resolve) {
    function listener () {
      window.removeEventListener('DOMContentLoaded', listener)
      resolve()
    }

    window.addEventListener('DOMContentLoaded', listener)
  })
}

onDocumentReady().then(async function () {
  const state = await RouterObservable.create(document.location.pathname)

  redirection.subscribe({
    next (value) {
      state.changeURL(value)
    },

    error (err) {
      state.error(err)
    },

    complete () {
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
