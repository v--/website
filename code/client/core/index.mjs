import { CoolError, HTTPError, ClientError } from '../../common/errors.mjs'
import { redirection } from '../../common/observables.mjs'
import { c } from '../../common/rendering/component.mjs'

import main from '../../common/components/main.mjs'
import title from '../../common/components/title.mjs'
import { iconMap } from '../../common/components/icon.mjs'

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

async function fetchIcons () {
  const response = await window.fetch('/icons.json')
  const icons = await response.json()

  for (const [name, icon] of Object.entries(icons)) {
    iconMap.set(name, icon)
  }
}

function restoreError (data) {
  switch (data.classID) {
    case 'HTTPError':
      return HTTPError.fromJSON(data)

    case 'ClientError':
      return ClientError.fromJSON(data)

    case 'CoolError':
      return CoolError.fromJSON(data)

    default:
      return new Error(data.message)
  }
}

Promise.all([onDocumentReady(), fetchIcons()]).then(async function () {
  // "data" is the id a script element
  const { data, errorData } = JSON.parse(window.data.textContent)
  const observable = await RouterObservable.initialize(data)

  observable.subscribe({
    error (err) {
      renderError(observable, err)
    }
  })

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

  window.addEventListener('error', function (event) {
    const err = event.error
    renderError(observable, err)
    err.preventDefault()
  })

  window.addEventListener('popstate', async function () {
    try {
      await observable.updateURL()
    } catch (err) {
      renderError(observable, err)
    }
  })

  if (errorData) {
    const err = restoreError(errorData)
    renderError(observable, err)
  } else {
    try {
      renderObservable(observable)
    } catch (err) {
      renderError(observable, err)
    }
  }
})
