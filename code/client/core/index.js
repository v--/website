import { CoolError, HTTPError, ClientError } from '../../common/errors.js'
import { redirection } from '../../common/global_subjects.js'
import { c } from '../../common/rendering/component.js'

import main from '../../common/components/main.js'
import title from '../../common/components/title.js'
import { iconMap } from '../../common/components/icon.js'

import RouterSubject from './support/router_subject.js'
import { onDocumentReady } from './support/dom.js'
import dispatcher from './render_dispatcher.js'

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

function renderError (subject, err) {
  console.error(err)
  subject.digestError(err)
  renderObservable(subject)
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
  const subject = await RouterSubject.initialize(data)

  subject.subscribe({
    error (err) {
      renderError(subject, err)
    }
  })

  redirection.subscribe({
    async next (value) {
      try {
        await subject.changeURL(value, true)
      } catch (err) {
        renderError(subject, err)
      }
    },

    error (err) {
      subject.error(err)
    },

    complete () {
      subject.complete()
    }
  })

  window.addEventListener('error', function (event) {
    const err = event.error
    renderError(subject, err)
    event.preventDefault()
  })

  window.addEventListener('popstate', async function () {
    try {
      await subject.updateURL()
    } catch (err) {
      renderError(subject, err)
    }
  })

  if (errorData) {
    const err = restoreError(errorData)
    renderError(subject, err)
  } else {
    try {
      renderObservable(subject)
    } catch (err) {
      renderError(subject, err)
    }
  }
})
