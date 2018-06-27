import { overloader } from '../common/support/functions'
import { IComponent, IXMLComponent, IFactoryComponent } from '../common/component'

const render = overloader(
  {
    iface: IXMLComponent,
    * impl (component) {
      yield `<${component.type}`

      for (const [key, value] of Object.entries(component.state.current)) {
        if (value === true) {
          yield ` ${key}`
        } else if (typeof value === 'string' && key !== 'text') {
          yield ` ${key}="${value}"`
        }
      }

      yield '>'

      if (component.isVoid) {
        return
      }

      if ('text' in component.state.current) {
        yield component.state.current.text
      }

      for (const child of component.children) {
        if (child instanceof IComponent) {
          yield * render(child)
        }
      }

      yield `</${component.type}>`
    }
  },

  {
    iface: IFactoryComponent,
    * impl (component) {
      yield * render(component.evaluate())
    }
  }
)

export default render
