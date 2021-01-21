import { Component, XMLComponent, FactoryComponent, HTMLComponent } from '../common/rendering/component.js'
import { RenderDispatcher } from '../common/rendering/renderer.js'

/**
 * @param {XMLComponent} component
 * @param {TRendering.IRenderDispatcher<Iterable<string>>} dispatcher
 * @returns {Iterable<string>}
 */
function * renderXMLComponent(component, dispatcher) {
  const state = component.state.value

  yield `<${component.type}`

  if (state) {
    for (const [key, value] of Object.entries(state)) {
      if (value === true) {
        yield ` ${key}`
      } else if (typeof value === 'string' && key !== 'text') {
        yield ` ${key}="${value}"`
      }
    }
  }

  yield '>'

  if (component instanceof HTMLComponent && component.isVoid) {
    return
  }

  if (state && 'text' in state) {
    yield state.text
  }

  for (const child of component.children) {
    if (child instanceof Component) {
      yield * dispatcher.render(child)
    }
  }

  yield `</${component.type}>`
}

/**
 * @param {FactoryComponent} component
 * @param {TRendering.IRenderDispatcher<Iterable<string>>} dispatcher
 * @returns {Iterable<string>}
 */
function renderFactoryComponent(component, dispatcher) {
  return dispatcher.render(component.evaluate())
}

export const dispatcher = new RenderDispatcher(
  renderXMLComponent,
  renderFactoryComponent
)
