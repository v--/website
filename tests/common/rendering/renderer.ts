import { describe, it, assert, assertCustomEqual } from '../../_common.js'

import { c, XMLComponent, ComponentSanityError, HTMLComponent, Component } from '../../../code/common/rendering/component.js'
import { RenderError, RenderDispatcher, INodeManipulator } from '../../../code/common/rendering/renderer.js'
import { BehaviorSubject } from '../../../code/common/observables/behavior_subject.js'
import { DictSubject } from '../../../code/common/observables/dict_subject.js'

export const mirrorDOMManipulator: INodeManipulator<XMLComponent> = {
  createNode(component: XMLComponent) {
    return HTMLComponent.safeCreate(component.type, component.state.value) as XMLComponent
  },

  setAttribute<T extends unknown>(node: XMLComponent, key: string, value: T, _oldValue?: T) {
    const oldState = node.state.value
    node.state.next({ ...oldState, [key]: value })
  },

  removeAttribute<T>(node: XMLComponent, key: string, _oldValue: T) {
    const oldState = node.state.value as Record<string, unknown> | undefined

    if (oldState) {
      const newState = { ...oldState }
      delete newState[key]
      node.state.next(newState)
    }
  },

  setText(node: XMLComponent, value: string) {
    this.setAttribute(node, 'text', value)
  },

  removeText(node: XMLComponent, ) {
    this.removeAttribute(node, 'text', undefined)
  },

  appendChild(node: XMLComponent, child: XMLComponent) {
    node.children.push(child)
  },

  replaceChild(node: XMLComponent, oldChild: XMLComponent, newChild: XMLComponent) {
    const index = node.children.indexOf(oldChild)
    node.children[index] = newChild
  },

  removeChild(node: XMLComponent, child: XMLComponent) {
    const index = node.children.indexOf(child)
    node.children.splice(index, 1)
  }
}

export const dispatcher = RenderDispatcher.fromRenderers(mirrorDOMManipulator)

function render(component: Component) {
  return dispatcher.render(component) as XMLComponent
}

describe('mirrorDOMManipulator for XML components', function() {
  describe('#render()', function() {
    it('renders simple components', function() {
      const src = c('div')
      const dest = render(src)
      assertCustomEqual(src, dest)
    })

    it('renders components with state', function() {
      const src = c('div', { a: 0 })
      const dest = render(src)

      assertCustomEqual(src, dest)
    })

    it('renders components with text children', function() {
      const src = c('div', { text: 'text' })
      const dest = render(src)

      assertCustomEqual(src, dest)
    })

    it('renders components with HTML children', function() {
      const src = c('div', undefined, c('span'), c('span', { text: 'text' }))
      const dest = render(src)

      assertCustomEqual(src, dest)
    })
  })

  describe('#rerender()', function() {
    it('adds new properties', function() {
      const subject = new BehaviorSubject<{ text?: string }>({})
      const src = c('div', subject)
      const dest = render(src)
      subject.next({ text: 'text' })
      assert.equal(dest.state.value.text, 'text')
    })

    it('updates existing properties', function() {
      const subject = new BehaviorSubject({ text: 'text' })
      const src = c('div', subject)
      const dest = render(src)
      subject.next({ text: 'updated text' })
      assert.equal(dest.state.value.text, 'updated text')
    })

    it('removes old properties', function() {
      const subject = new BehaviorSubject<{ text?: string }>({ text: 'text' })
      const src = c('div', subject)
      const dest = render(src)
      subject.next({})
      assert.doesNotHaveAllKeys(dest.state.value, ['text'])
    })

    it('throws when adding text to an HTML component with children', function() {
      const subject = new BehaviorSubject<{ text?: string }>({})
      const src = c('div', subject, c('span'))
      render(src)

      assert.throws(function() {
        return subject.next({ text: 'text' })
      }, ComponentSanityError)
    })

    it('can rerender multiple times', function() {
      const subject = new BehaviorSubject({ text: 'basic' })

      const src = c('div', subject)
      const dest = render(src)
      subject.next({ text: 'extended' })
      subject.next({ text: 'premium' })

      assert.equal(dest.state.value.text, 'premium')
    })
  })
})

describe('mirrorDOMManipulator for factory components', function() {
  describe('#render()', function() {
    it('renders constants', function() {
      const constant = render(c('div'))
      const src = c(() => constant, {})
      const dest = render(src)

      assertCustomEqual(dest, constant)
    })

    it('renders simple text', function() {
      const src = c(({ text }) => c('span', { text }), { text: 'text' })
      const dest = render(src)

      assert.equal(dest.state.value.text, 'text')
    })

    it('throws when attempting to render the same component twice', function() {
      const component = c('span')

      function factory() {
        return c('div', undefined, component, component)
      }

      assert.throws(render.bind(null, c(factory, {})), RenderError)
    })
  })

  describe('#rerender()', function() {
    it("throws when trying to replace the root element's type", function() {
      const subject = new BehaviorSubject({ type: 'div' })
      const src = c(({ type }) => c(type), subject)
      render(src)

      assert.throws(function() {
        return subject.next({ type: 'span' })
      }, RenderError)
    })

    it('adds root children', function() {
      const subject = new BehaviorSubject({ add: false })
      const src = c(({ add }) => c('div', undefined, add && c('span')), subject)
      const dest = render(src)
      subject.next({ add: true })
      assert.isNotEmpty(dest.children)
    })

    it("updates root element's properties", function() {
      const subject = new BehaviorSubject({ text: 'text' })
      const src = c(({ text }) => c('div', { text }), subject)
      const dest = render(src)
      subject.next({ text: 'updated text' })
      assert.equal(dest.state.value.text, 'updated text')
    })

    it('replaces root children', function() {
      const subject = new BehaviorSubject({ type: 'div' })
      const src = c(({ type }) => c('div', undefined, c(type)), subject)
      const dest = render(src)
      subject.next({ type: 'span' })
      assert.equal(dest.children[0].type, 'span')
    })

    it('removes root children', function() {
      const subject = new BehaviorSubject({ add: true })
      const src = c(({ add }) => c('div', undefined, add && c('span')), subject)
      const dest = render(src)
      subject.next({ add: false })
      assert.isEmpty(dest.children)
    })

    it('handles swapping', function() {
      const subject = new BehaviorSubject<{ components: [string, string, string] }>({ components: ['h1', 'h2', 'h3'] })

      function factory({ components }: { components: [string, string, string] }) {
        return c('div', undefined, c(components[0]), c(components[1]), c(components[2]))
      }

      const src = c(factory, subject)
      const dest = render(src)
      subject.next({ components: ['h3', 'h2', 'h1'] })

      assert.deepEqual(
        dest.children.map(child => child.type),
        ['h3', 'h2', 'h1']
      )
    })

    it('throws when swapping existing elements', function() {
      const h1 = c('h1')
      const h2 = c('h2')
      const h3 = c('h3')

      const subject = new BehaviorSubject({ components: [h1, h2, h3] })

      function factory({ components }: { components: Components.IComponent[] }) {
        return c('div', undefined, ...components)
      }

      const src = c(factory, subject)
      render(src)

      assert.throws(function() {
        return subject.next({ components: [h3, h2, h1] })
      }, RenderError)
    })

    it('handles nested component swapping', function() {
      const subject = new BehaviorSubject<{ components: [string, string, string] }>({ components: ['h1', 'h2', 'h3'] })

      function factory({ components }: { components: [string, string, string] }) {
        return c('main', undefined,
          c('div', undefined, c(components[0]), c(components[1]), c(components[2]))
        )
      }

      const src = c(factory, subject)
      const dest = render(src)
      subject.next({ components: ['h3', 'h2', 'h1'] })

      assert.deepEqual(
        dest.children[0].children.map(child => child.type),
        ['h3', 'h2', 'h1']
      )
    })

    it('can rerender multiple times', function() {
      const subject = new BehaviorSubject({ text: 'basic' })

      function factory({ text }: { text: string }) {
        return c('span', { text })
      }

      const src = c(factory, subject)
      const dest = render(src)
      subject.next({ text: 'extended' })
      subject.next({ text: 'premium' })

      assert.equal(dest.state.value.text, 'premium')
    })

    it('can rerender multiple components using the same observable', function() {
      const outerSubject = new BehaviorSubject({})
      const subject = new BehaviorSubject({ text: 'text' })

      function factory1({ text }: { text: string }) {
        return c('p', { text })
      }

      function factory2({ text }: { text: string }) {
        return c('p', { text })
      }

      function outerFactory() {
        return c(
          'div',
          undefined,
          c(factory1, subject),
          c(factory2, subject)
        )
      }

      const src = c(outerFactory, outerSubject)
      const dest = render(src)

      subject.next({ text: 'updated text' })
      assert.equal(dest.children[0].state.value.text, 'updated text')
      assert.equal(dest.children[1].state.value.text, 'updated text')
    })

    // BUGFIXES

    it('can rerender multiple with subcomponent replacements', function() {
      const subject = new BehaviorSubject({ type: 'div' })

      function factory({ type }: { type: string }) {
        return c('div', undefined, c(type))
      }

      const src = c(factory, subject)
      const dest = render(src)
      subject.next({ type: 'span' })
      subject.next({ type: 'div' })

      assert.equal(dest.type, 'div')
    })

    it('can rerender on nested observable change', function() {
      function factory() {
        const subject = new DictSubject({
          text: 'text',
          updateText(text: string) {
            subject.update({ text })
          }
        })

        return c('div', subject)
      }

      const src = c(factory, {})
      const dest = render(src)
      dest.state.value.updateText('updated text')

      assert.equal(dest.state.value.text, 'updated text')
    })

    it('can rerender on nested observable change if the parent has also changed', function() {
      const outerSubject = new DictSubject({})

      function factory() {
        const subject = new DictSubject({
          text: 'text',
          updateText(text: string) {
            subject.update({ text })
          }
        })

        return c('div', subject)
      }

      const src = c(factory, outerSubject)
      const dest = render(src)

      outerSubject.next({})
      dest.state.value.updateText('updated text')

      assert.equal(dest.state.value.text, 'updated text')
    })

    it('can rerender on observable change in transcluded components nested in XML components', function() {
      const outerSubject = new BehaviorSubject({ text: 'text' })

      function transcluded(_state: unknown, children: Components.IComponent[]) {
        return c('main', undefined, ...children)
      }

      function factory({ text }: { text: string }) {
        return c('div', { text })
      }

      function outerFactory({ text }: { text: string }) {
        return c('body', undefined,
          c(transcluded, undefined,
            c(factory, { text })
          )
        )
      }

      const src = c(outerFactory, outerSubject)
      const dest = render(src)

      outerSubject.next({ text: 'updated text' })

      assert.equal(dest.children[0].children[0].state.value.text, 'updated text')
    })

    it('can add new children to transcluded components nested in XML components', function() {
      const outerSubject = new BehaviorSubject<{ text?: string }>({})

      function transcluded(_state: unknown, children: Components.IComponent[]) {
        return c('main', undefined, ...children)
      }

      function factory({ text }: { text?: string }) {
        return c('div', { text })
      }

      function outerFactory({ text }: { text?: string }) {
        return c('body', undefined,
          c(transcluded, undefined,
            text && c(factory, { text })
          )
        )
      }

      const src = c(outerFactory, outerSubject)
      const dest = render(src)

      outerSubject.next({ text: 'text' })
      assert.equal(dest.children[0].children[0].state.value.text, 'text')
    })
  })
})
