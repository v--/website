import { CoolError } from '../errors.ts'
import { Component, FactoryComponent, type IFactoryComponentState, XmlComponent } from './component.ts'
import { repr } from '../support/strings.ts'
import { type IComponentEnvironment } from './component/component.ts'
import { getObjectEntries } from '../support/iteration.ts'

class StaticRenderError extends CoolError {}

export async function renderToString(component: Component, env: IComponentEnvironment): Promise<string> {
  if (component instanceof XmlComponent) {
    const strings = await Array.fromAsync(iterStaticRenderXmlComponent(component, env))
    return strings.join('')
  }

  if (component instanceof FactoryComponent) {
    return renderFactoryComponent(component, env)
  }

  throw new StaticRenderError("Don't know how to render component", { component: repr(component) })
}

async function* iterStaticRenderXmlComponent(component: XmlComponent, env: IComponentEnvironment): AsyncIterable<string> {
  const state = await component.getState()

  yield `<${component.type}`

  if (state) {
    for (const [key, value] of getObjectEntries(state)) {
      if (value === true) {
        yield ` ${key}`
      } else if (typeof value === 'string' && key !== 'text') {
        yield ` ${key}="${value}"`
      }
    }
  }

  yield '>'

  if (component instanceof XmlComponent && component.isVoid()) {
    return
  }

  if (state && 'text' in state) {
    yield state.text as string
  }

  for (const child of component.iterChildren()) {
    yield await renderToString(child, env)
  }

  yield `</${component.type}>`
}

async function renderFactoryComponent<StateT extends IFactoryComponentState>(
  component: FactoryComponent<StateT>,
  env: IComponentEnvironment,
): Promise<string> {
  const state = await component.getState() as StateT
  const root = await component.evaluate(state, env)
  return renderToString(root, env)
}
