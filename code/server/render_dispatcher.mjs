import { Component, XMLComponent, FactoryComponent } from '../common/rendering/component.mjs'
import { RenderDispatcher } from '../common/rendering/renderer.mjs'

function * renderXMLComponent (component, dispatcher) {
  const state = component.state.value

  yield `<${component.type}`

  if (state !== null) {
    for (const [key, value] of Object.entries(state)) {
      if (value === true) {
        yield ` ${key}`
      } else if (typeof value === 'string' && key !== 'text') {
        yield ` ${key}="${value}"`
      }
    }
  }

  yield '>'

  if (component.isVoid) {
    return
  }

  if (state !== null && 'text' in state) {
    yield state.text
  }

  for (const child of component.children) {
    if (child instanceof Component) {
      yield * dispatcher.render(child)
    }
  }

  yield `</${component.type}>`
}

function renderFactoryComponent (component, dispatcher) {
  return dispatcher.render(component.evaluate())
}

export default new RenderDispatcher(new Map([
  [XMLComponent, renderXMLComponent],
  [FactoryComponent, renderFactoryComponent]
]))
