/* eslint-env browser */

import { ErrorJsonObject } from '../../common/errors.js'
import { location$ } from '../../common/shared_observables.js'
import { c } from '../../common/rendering/component.js'

import { main } from '../../common/components/main.js'
import { title } from '../../common/components/title.js'
import { iconMap } from '../../common/components/icon.js'

import { RouterService } from './services/router.js'
import { onDocumentReady, getCurrentURL } from './support/dom.js'
import { dispatcher } from './render_dispatcher.js'
import { IObservable } from '../../common/observables/observable.js'
import { RouterState } from '../../common/support/router_state.js'
import { processErrorJsonObject, restoreError } from '../../common/support/process_error.js'

function renderObservable(observable: IObservable<RouterState>) {
  document.body.replaceChild(
    dispatcher.render(c(main, observable)),
    document.querySelector('main')!
  )

  document.head.replaceChild(
    dispatcher.render(c(title, observable)),
    document.querySelector('title')!
  )
}

function renderError(routerService: RouterService, err: Error) {
  console.error(err)
  routerService.state$.complete()
  routerService.displayError(getCurrentURL(), err)
  renderObservable(routerService.state$)
}

async function fetchIcons() {
  const response = await window.fetch('/icons.json')
  const icons = await response.json()

  for (const [name, icon] of Object.entries(icons)) {
    iconMap.set(name, icon)
  }
}

interface ServerData {
  data?: unknown
  errorData?: ErrorJsonObject
}

function readServerData(): ServerData {
  try {
    const { data, errorData } = JSON.parse(window.data.textContent!)

    return {
      data,
      errorData: errorData && processErrorJsonObject(errorData)
    }
  } catch (err) {
    console.error(err)
    // Silently ignore this error
  }

  return {}
}

Promise.all([onDocumentReady(), fetchIcons()]).then(async function() {
  // "data" is the id a script element
  const { data, errorData } = readServerData()
  const service = await RouterService.initialize(getCurrentURL(), data)

  service.state$.subscribe({
    error(err) {
      renderError(service, err)
    }
  })

  location$.subscribe({
    async next(value) {
      try {
        await service.changeURL(value)
      } catch (err) {
        renderError(service, err)
      }
    },

    error(err: Error) {
      service.displayError(getCurrentURL(), err)
    }
  })

  window.addEventListener('error', function(event) {
    const err = event.error
    renderError(service, err)
    event.preventDefault()
  })

  window.addEventListener('popstate', async function() {
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
