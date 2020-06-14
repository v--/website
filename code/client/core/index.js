/* eslint-env browser */

import { GenericError, HTTPError, ClientError } from '../../common/errors.js'
import { location$ } from '../../common/shared_observables.js'
import { c } from '../../common/rendering/component.js'

import { main } from '../../common/components/main.js'
import { title } from '../../common/components/title.js'
import { iconMap } from '../../common/components/icon.js'

import { RouterService } from './services/router.js'
import { onDocumentReady, getCurrentURL } from './support/dom.js'
import { dispatcher } from './render_dispatcher.js'

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

function renderError (routerService, err) {
  console.error(err)
  routerService.state$.complete()
  routerService.displayError(getCurrentURL(), err)
  renderObservable(routerService.state$)
}

async function fetchIcons () {
  const response = await window.fetch('/icons.json')
  const icons = await response.json()

  for (const [name, icon] of Object.entries(icons)) {
    iconMap.set(name, icon)
  }
}

function restoreError (data) {
  switch (data.classId) {
    case 'HTTPError':
      return HTTPError.fromJSON(data)

    case 'ClientError':
      return ClientError.fromJSON(data)

    case 'CoolError':
    default:
      return GenericError.fromJSON(data)
  }
}

Promise.all([onDocumentReady(), fetchIcons()]).then(async function () {
  // "data" is the id a script element
  const { data, errorData } = JSON.parse(window.data.textContent)
  const service = await RouterService.initialize(getCurrentURL(), data)

  service.state$.subscribe({
    error (err) {
      renderError(service, err)
    }
  })

  location$.subscribe({
    async next (value) {
      try {
        await service.changeURL(value)
      } catch (err) {
        renderError(service, err)
      }
    },

    error (err) {
      service.error(err)
    },

    complete () {
      service.complete()
    }
  })

  window.addEventListener('error', function (event) {
    const err = event.error
    renderError(service, err)
    event.preventDefault()
  })

  window.addEventListener('popstate', async function () {
    try {
      await service.processURL(getCurrentURL())
    } catch (err) {
      renderError(service, err)
    }
  })

  if (errorData) {
    const err = restoreError(errorData)
    renderError(service, err)
  } else {
    try {
      renderObservable(service.state$)
    } catch (err) {
      renderError(service, err)
    }
  }
})
