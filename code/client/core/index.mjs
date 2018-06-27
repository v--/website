/* eslint-env browser */

import { redirection } from '../../common/observables'
import { c } from '../../common/component'

import main from '../../common/components/main'
import title from '../../common/components/title'

import RouterObservable from '../core/support/router_observable'
import render from './render'

window.COMPATIBLE_INTERPRETER = Object.hasOwnProperty('assign')
window.bundles = new Map()

function onDocumentReady () {
  if (!window.COMPATIBLE_INTERPRETER) {
    return new Promise(function () {})
  }

  if (document.readyState === 'complete') {
    return Promise.resolve()
  }

  return new Promise(function (resolve) {
    function listener () {
      window.removeEventListener('DOMContentLoaded', listener)
      resolve()
    }

    window.addEventListener('DOMContentLoaded', listener)
  })
}

function renderObservable (observable) {
  document.body.replaceChild(
    render(c(main, observable)),
    document.querySelector('main')
  )

  document.head.replaceChild(
    render(c(title, observable)),
    document.querySelector('title')
  )
}

function renderError (observable, err) {
  console.error(err)
  observable.clearObservers()
  observable.digestError(err)
  renderObservable(observable)
}

onDocumentReady().then(async function () {
  const observable = await RouterObservable.initialize()

  redirection.subscribe({
    async next (value) {
      try {
        await observable.changeURL(value, true)
      } catch (err) {
        renderError(observable, err)
      }
    },

    error (err) {
      observable.error(err)
    },

    complete () {
      observable.complete()
    }
  })

  window.addEventListener('error', function (e) {
    renderError(observable, e.error)
    e.preventDefault()
  })

  window.addEventListener('popstate', async function () {
    try {
      await observable.updateURL()
    } catch (err) {
      renderError(observable, err)
    }
  })

  try {
    renderObservable(observable)
  } catch (err) {
    renderError(observable, err)
  }
})
