import { assert } from '../../_common.js'

import {
  Component,
  XMLComponent,
  HTMLComponent,
  FactoryComponent,
  ComponentCreationError,
  ComponentSanityError,
  InvalidComponentError
} from '../../../code/common/rendering/component.js'

describe('Component', function () {
  describe('.safeCreate()', function () {
    it('creates components using only a type', function () {
      const component = Component.safeCreate('div')
      assert.equal(component.type, 'div')
      assert.deepEqual(component.state.value, null)
      assert.deepEqual(component.children, [])
    })

    it('preserves the state object', function () {
      const state = {}
      const component = Component.safeCreate('div', state)
      assert.deepEqual(component.state.value, state)
    })

    it('filters falsy children', function () {
      const child = Component.safeCreate('span')
      const component = Component.safeCreate('div', null, null, undefined, 0, false, '', child)
      assert.lengthOf(component.children, 1)
      assert.include(component.children, child)
    })

    it('throws if the state is an invalid data type', function () {
      function factory () {
        return Component.safeCreate('div', undefined)
      }

      assert.throws(factory, ComponentCreationError)
    })

    it('throws if a non-component truthy child is passed', function () {
      function factory () {
        return Component.safeCreate('div', null, true)
      }

      assert.throws(factory, InvalidComponentError)
    })
  })

  describe('.toString()', function () {
    it('works on flat components', function () {
      const component = Component.safeCreate('div')
      assert.equal(String(component), "Component('div', null)")
    })

    it('works on nested components', function () {
      const child1 = Component.safeCreate('span', { text: 'text1' })
      const child2 = Component.safeCreate('span', { text: 'text2' })
      const component = Component.safeCreate('div', null, child1, child2)

      const string = `Component('div', null,
\tComponent('span', { text: 'text1' }),
\tComponent('span', { text: 'text2' })
)`

      assert.equal(String(component), string)
    })

    it('works on doubly nested components', function () {
      const inner = Component.safeCreate('span', { label: 'inner' })
      const outer = Component.safeCreate('span', { label: 'outer' }, inner)
      const component = Component.safeCreate('div', null, outer)

      const string = `Component('div', null,
\tComponent('span', { label: 'outer' },
\t\tComponent('span', { label: 'inner' })
\t)
)`

      assert.equal(String(component), string)
    })
  })
})

describe('XMLComponent', function () {
  class SVGComponent extends XMLComponent {
    get namespace () {
      return 'https://www.w3.org/2000/svg'
    }
  }

  describe('.safeCreate()', function () {
    it('throws if no namespace exists in the class', function () {
      function factory () {
        return XMLComponent.safeCreate('div')
      }

      assert.throws(factory, ComponentSanityError)
    })

    it('succeeds if a namespace exists in the class', function () {
      function factory () {
        return SVGComponent.safeCreate('g')
      }

      assert.doesNotThrow(factory, ComponentSanityError)
    })

    it('throws if the type is not a string', function () {
      function factory () {
        return SVGComponent.safeCreate(undefined)
      }

      assert.throws(factory, Error)
    })

    it('throws if the type string is empty', function () {
      function factory () {
        return SVGComponent.safeCreate('')
      }

      assert.throws(factory, ComponentCreationError)
    })

    it('throws if a component has both text and children', function () {
      function factory () {
        const child = SVGComponent.safeCreate('text')
        return SVGComponent.safeCreate('g', { text: 'text' }, child)
      }

      assert.throws(factory, ComponentCreationError)
    })
  })
})

describe('HTMLComponent', function () {
  describe('.checkSanity()', function () {
    it('throws if a void component has children', function () {
      function factory () {
        const child = HTMLComponent.safeCreate('span')
        return HTMLComponent.safeCreate('base', null, child)
      }

      assert.throws(factory, ComponentSanityError)
    })

    it('throws if a void component has text', function () {
      function factory () {
        return HTMLComponent.safeCreate('base', { text: 'text' })
      }

      assert.throws(factory, ComponentSanityError)
    })
  })
})

describe('FactoryComponent', function () {
  describe('.checkSanity()', function () {
    it('throws if the type is not a function', function () {
      function factory () {
        return FactoryComponent.safeCreate(undefined)
      }

      assert.throws(factory, ComponentCreationError)
    })
  })

  describe('.evaluate()', function () {
    it('handles simple factories', function () {
      const component = HTMLComponent.safeCreate('div', { text: 'text' })

      function factory ({ text }) {
        return HTMLComponent.safeCreate('div', { text })
      }

      const evaluated = FactoryComponent.safeCreate(factory, { text: 'text' }).evaluate()
      assert.equalComponents(evaluated, component)
    })

    it("throws if the factory doesn't return a component", function () {
      function factory () {
        return null
      }

      const component = FactoryComponent.safeCreate(factory)

      assert.throws(function () {
        component.evaluate()
      })
    })
  })
})
