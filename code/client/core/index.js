import { location$ } from '../../common/shared_observables.js'
import { c } from '../../common/rendering/component.js'

import { main } from '../../common/components/main.js'
import { title } from '../../common/components/title.js'
import { iconMap } from '../../common/components/icon.js'

import { RouterService } from './services/router.js'
import { onDocumentReady, getCurrentURL } from './support/dom.js'
import { dispatcher } from './render_dispatcher.js'
import { processErrorJsonObject, restoreError } from '../../common/store/errors.js'
import { microtaskEnqueue } from '../../common/observables/operators.js'

/**
 * @param {TObservables.IObservable<TRouter.IRouterState>} observable
 */
function renderObservable(observable) {
  const mainElement = document.querySelector('main')

  if (mainElement) {
    document.body.replaceChild(
      dispatcher.render(c(main, observable)),
      mainElement
    )
  }

  const titleElement = document.querySelector('title')

  if (titleElement) {
    document.head.replaceChild(
      dispatcher.render(c(title, observable)),
      titleElement
    )
  }
}

/**
 * @param {RouterService} routerService
 * @param {Error} err
 */
function renderError(routerService, err) {
  console.error(err)
  routerService.state$.complete()
  routerService.displayError(getCurrentURL(), err)
  renderObservable(routerService.state$)
}

async function fetchIcons() {
  const response = await window.fetch('/icons.json')
  /** @type {Record<string, string>} */
  const icons = await response.json()

  for (const [name, icon] of Object.entries(icons)) {
    iconMap.set(name, icon)
  }
}

/**
 * @typedef {{ data?: unknown, errorData?: TErrors.ErrorJsonObject }} ServerData
 */

/**
 * @returns {ServerData}
 */
function readServerData() {
  try {
    const { data, errorData } = JSON.parse((/** @type {any} */ (window)).data.textContent)

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
  const service = await RouterService.initialize(getCurrentURL(), data, errorData)

  service.state$.subscribe({
    /**
     * @param {Error} err
     */
    error(err) {
      renderError(service, err)
    }
  })

  microtaskEnqueue(location$).subscribe({
    /**
     * @param {string} value
     */
    async next(value) {
      try {
        await service.changeURL(value)
      } catch (err) {
        renderError(service, err)
      }
    },

    /**
     * @param {Error} err
     */
    error(err) {
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
