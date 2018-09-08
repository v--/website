/* eslint-env browser */

import { redirection } from '../../common/observables.mjs'
import { c } from '../../common/rendering/component.mjs'

import main from '../../common/components/main.mjs'
import title from '../../common/components/title.mjs'

import RouterObservable from './support/router_observable.mjs'
import { onDocumentReady } from './support/dom.mjs'
import dispatcher from './render_dispatcher.mjs'

function renderObservable (observable) {
  document.body.replaceChild(
    dispatcher.render(c(main, observable)),
    document.querySelector('main')
  )

  document.head.replaceChild(
    dispatcher.render(c(title, observable)),
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
