import { describe, it, assert, assertCustomEqual } from '../../_test_common.js'

import { c, XMLComponent, ComponentSanityError, HTMLComponent, Component } from './component.js'
import { RenderError, RenderDispatcher } from './renderer.js'
import { BehaviorSubject } from '../observables/behavior_subject.js'
import { DictSubject } from '../observables/dict_subject.js'

/** @type {TRendering.INodeManipulator<XMLComponent>} */
export const mirrorDOMManipulator = {
  /**
   * @param {XMLComponent} component
   */
  createNode(component) {
    return /** @type {XMLComponent} */ (
      HTMLComponent.safeCreate(component.type, component.state.value)
    )
  },

  /**
   * @param {XMLComponent} node
   * @param {string} key
   * @param {unknown} value
   * @param {unknown} [_oldValue]
   */
  setAttribute(node, key, value, _oldValue) {
    const oldState = node.state.value
    node.state.next({ ...oldState, [key]: value })
  },

  /**
   * @param {XMLComponent} node
   * @param {string} key
   * @param {unknown} _oldValue
   */
  removeAttribute(node, key, _oldValue) {
    const oldState = /** @type {Record<string, unknown> | undefined} */ (node.state.value)

    if (oldState) {
      const newState = { ...oldState }
      delete newState[key]
      node.state.next(newState)
    }
  },

  /**
   * @param {XMLComponent} node
   * @param {string} value
   */
  setText(node, value) {
    this.setAttribute(node, 'text', value)
  },

  /**
   * @param {XMLComponent} node
   */
  removeText(node) {
    this.removeAttribute(node, 'text', undefined)
  },

  /**
   * @param {XMLComponent} node
   * @param {XMLComponent} child
   */
  appendChild(node, child) {
    node.children.push(child)
  },

  /**
   * @param {XMLComponent} node
   * @param {XMLComponent} oldChild
   * @param {XMLComponent} newChild
   */
  replaceChild(node, oldChild, newChild) {
    const index = node.children.indexOf(oldChild)
    node.children[index] = newChild
  },

  /**
   * @param {XMLComponent} node
   * @param {XMLComponent} child
   */
  removeChild(node, child) {
    const index = node.children.indexOf(child)
    node.children.splice(index, 1)
  }
}

export const dispatcher = RenderDispatcher.fromManipulator(mirrorDOMManipulator)

/**
 * @param {Component} component
 */
function render(component) {
  return /** @type {XMLComponent} */ (
    dispatcher.render(component)
  )
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
      /** @type {BehaviorSubject<{ text?: string }>} */
      const subject = new BehaviorSubject({})
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
      /** @type {BehaviorSubject<{ text?: string }>} */
      const subject = new BehaviorSubject({ text: 'text' })
      const src = c('div', subject)
      const dest = render(src)
      subject.next({})
      assert.doesNotHaveAllKeys(dest.state.value, ['text'])
    })

    it('throws when adding text to an HTML component with children', function() {
      /** @type {BehaviorSubject<{ text?: string }>} */
      const subject = new BehaviorSubject({})
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
      /** @type {BehaviorSubject<{ components: [string, string, string] }>} */
      const subject = new BehaviorSubject({ components: ['h1', 'h2', 'h3'] })

      /** @param {{ components: [string, string, string] }} state */
      function factory({ components }) {
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

      /** @param {{ components: TComponents.IComponent[] }} state */
      function factory({ components }) {
        return c('div', undefined, ...components)
      }

      const src = c(factory, subject)
      render(src)

      assert.throws(function() {
        return subject.next({ components: [h3, h2, h1] })
      }, RenderError)
    })

    it('handles nested component swapping', function() {
      /** @type {BehaviorSubject<{ components: [string, string, string] }>} */
      const subject = new BehaviorSubject({ components: ['h1', 'h2', 'h3'] })

      /** @param {{ components: [string, string, string] }} state */
      function factory({ components }) {
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

      /** @param {{ text: string }} state */
      function factory({ text }) {
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

      /** @param {{ text: string }} state */
      function factory1({ text }) {
        return c('p', { text })
      }

      /** @param {{ text: string }} state */
      function factory2({ text }) {
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

      /** @param {{ type: string }} state */
      function factory({ type }) {
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
          /** @param {string} text */
          updateText(text) {
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
          /** @param {string} text */
          updateText(text) {
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

      /**
       * @param {unknown} _state
       * @param {TComponents.IComponent[]} children
       */
      function transcluded(_state, children) {
        return c('main', undefined, ...children)
      }

      /** @param {{ text: string }} state */
      function factory({ text }) {
        return c('div', { text })
      }

      /** @param {{ text: string }} state */
      function outerFactory({ text }) {
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
      /** @type {BehaviorSubject<{ text?: string }>} */
      const outerSubject = new BehaviorSubject({})

      /**
       * @param {unknown} _state
       * @param {TComponents.IComponent[]} children
       */
      function transcluded(_state, children) {
        return c('main', undefined, ...children)
      }

      /** @param {{ text?: string }} state */
      function factory({ text }) {
        return c('div', { text })
      }

      /** @param {{ text?: string }} state */
      function outerFactory({ text }) {
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
