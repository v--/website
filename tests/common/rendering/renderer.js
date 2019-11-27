import { describe, it, assert } from '../../_common.js'

import { c, XMLComponent, FactoryComponent, ComponentSanityError } from '../../../code/common/rendering/component.js'
import { XMLRenderer, FactoryRenderer, RenderError, RenderDispatcher } from '../../../code/common/rendering/renderer.js'
import { map } from '../../../code/common/support/iteration.js'
import { BehaviorSubject } from '../../../code/common/observables/behavior_subject.js'

export class MirrorXMLRenderer extends XMLRenderer {
  _createNode () {
    return this.component.constructor.safeCreate(this.component.type, this.component.state.value)
  }

  _setAttribute (key, value) {
    const oldState = this.element.state.value
    this.element.state.next(oldState === null ? { [key]: value } : Object.assign(oldState, { [key]: value }))
  }

  _removeAttribute (key, oldValue) { // eslint-disable-line no-unused-vars
    const oldState = this.element.state.value

    if (oldState !== null) {
      const newState = Object.assign({}, oldState)
      delete newState[key]
      this.element.state.next(newState)
    }
  }

  _setText (value) {
    this._setAttribute('text', value)
  }

  _removeText (oldValue) {
    this._removeAttribute('text', oldValue)
  }

  _appendChild (child) {
    this.element.children.push(child)
  }

  _replaceChild (oldChild, newChild) {
    const index = this.element.children.indexOf(oldChild)
    this.element.children[index] = newChild
  }

  _removeChild (child) {
    const index = this.element.children.indexOf(child)
    this.element.children.splice(index, 1)
  }
}

const dispatcher = RenderDispatcher.fromRenderers(new Map([
  [XMLComponent, MirrorXMLRenderer],
  [FactoryComponent, FactoryRenderer]
]))

const render = RenderDispatcher.prototype.render.bind(dispatcher)

describe('MirrorXMLRenderer', function () {
  describe('#render()', function () {
    it('renders simple components', function () {
      const src = c('div')
      const dest = render(src)
      assert.customEqual(src, dest)
    })

    it('renders components with state', function () {
      const src = c('div', { a: 0 })
      const dest = render(src)

      assert.customEqual(src, dest)
    })

    it('renders components with text children', function () {
      const src = c('div', { text: 'text' })
      const dest = render(src)

      assert.customEqual(src, dest)
    })

    it('renders components with HTML children', function () {
      const src = c('div', null, c('span'), c('span', { text: 'text' }))
      const dest = render(src)

      assert.customEqual(src, dest)
    })
  })

  describe('#rerender()', function () {
    it('adds new properties', function () {
      const subject = new BehaviorSubject(null)
      const src = c('div', subject)
      const dest = render(src)
      subject.next({ text: 'text' })
      assert.equal(dest.state.value.text, 'text')
    })

    it('updates existing properties', function () {
      const subject = new BehaviorSubject({ text: 'text' })
      const src = c('div', subject)
      const dest = render(src)
      subject.next({ text: 'updated text' })
      assert.equal(dest.state.value.text, 'updated text')
    })

    it('removes old properties', function () {
      const subject = new BehaviorSubject({ text: 'text' })
      const src = c('div', subject)
      const dest = render(src)
      subject.next({})
      assert.doesNotHaveAllKeys(dest.state.value, ['text'])
    })

    it('throws when adding text to an HTML component with children', function () {
      const subject = new BehaviorSubject(null)
      const src = c('div', subject, c('span'))
      render(src)

      assert.throws(function () {
        return subject.next({ text: 'text' })
      }, ComponentSanityError)
    })

    it('can rerender multiple times', function () {
      const subject = new BehaviorSubject({ text: 'basic' })

      const src = c('div', subject)
      const dest = render(src)
      subject.next({ text: 'extended' })
      subject.next({ text: 'premium' })

      assert.equal(dest.state.value.text, 'premium')
    })
  })
})

describe('MirrorFactoryRenderer', function () {
  describe('#render()', function () {
    it('renders constants', function () {
      const constant = render(c('div'))
      const src = c(() => constant)
      const dest = render(src)

      assert.customEqual(dest, constant)
    })

    it('renders simple text', function () {
      const src = c(({ text }) => c('span', { text }), { text: 'text' })
      const dest = render(src)

      assert.equal(dest.state.value.text, 'text')
    })

    it('throws when attempting to render the same component twice', function () {
      const component = c('span')

      function factory () {
        return c('div', null, component, component)
      }

      assert.throws(render.bind(null, c(factory)), RenderError)
    })
  })

  describe('#rerender()', function () {
    it("throws when trying to replace the root element's type", function () {
      const subject = new BehaviorSubject({ type: 'div' })
      const src = c(({ type }) => c(type), subject)
      render(src)

      assert.throws(function () {
        return subject.next({ type: 'span' })
      }, RenderError)
    })

    it('adds root children', function () {
      const subject = new BehaviorSubject({ add: false })
      const src = c(({ add }) => c('div', null, add && c('span')), subject)
      const dest = render(src)
      subject.next({ add: true })
      assert.notEmpty(dest.children)
    })

    it("updates root element's properties", function () {
      const subject = new BehaviorSubject({ text: 'text' })
      const src = c(({ text }) => c('div', { text }), subject)
      const dest = render(src)
      subject.next({ text: 'updated text' })
      assert.equal(dest.state.value.text, 'updated text')
    })

    it('replaces root children', function () {
      const subject = new BehaviorSubject({ type: 'div' })
      const src = c(({ type }) => c('div', null, c(type)), subject)
      const dest = render(src)
      subject.next({ type: 'span' })
      assert.equal(dest.children[0].type, 'span')
    })

    it('removes root children', function () {
      const subject = new BehaviorSubject({ add: true })
      const src = c(({ add }) => c('div', null, add && c('span')), subject)
      const dest = render(src)
      subject.next({ add: false })
      assert.empty(dest.children)
    })

    it('handles swapping', function () {
      const subject = new BehaviorSubject({ components: ['h1', 'h2', 'h3'] })

      function factory ({ components }) {
        return c('div', null, ...map(c, components))
      }

      const src = c(factory, subject)
      const dest = render(src)
      subject.next({ components: ['h3', 'h2', 'h1'] })

      assert.deepEqual(
        dest.children.map(child => child.type),
        ['h3', 'h2', 'h1']
      )
    })

    it('throws when swapping existing elements', function () {
      const h1 = c('h1')
      const h2 = c('h2')
      const h3 = c('h3')

      const subject = new BehaviorSubject({ components: [h1, h2, h3] })

      function factory ({ components }) {
        return c('div', null, ...components)
      }

      const src = c(factory, subject)
      render(src)

      assert.throws(function () {
        return subject.next({ components: [h3, h2, h1] })
      }, RenderError)
    })

    it('handles nested component swapping', function () {
      const subject = new BehaviorSubject({ components: ['h1', 'h2', 'h3'] })

      function factory ({ components }) {
        return c('main', null,
          c('div', null, ...map(c, components))
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

    it('can rerender multiple times', function () {
      const subject = new BehaviorSubject({ text: 'basic' })

      function factory ({ text }) {
        return c('span', { text })
      }

      const src = c(factory, subject)
      const dest = render(src)
      subject.next({ text: 'extended' })
      subject.next({ text: 'premium' })

      assert.equal(dest.state.value.text, 'premium')
    })

    it('can rerender multiple components using the same observable', function () {
      const outerSubject = new BehaviorSubject({})
      const subject = new BehaviorSubject({ text: 'text' })

      function factory1 ({ text }) {
        return c('p', { text })
      }

      function factory2 ({ text }) {
        return c('p', { text })
      }

      function outerFactory () {
        return c(
          'div',
          null,
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

    it('can rerender multiple with subcomponent replacements', function () {
      const subject = new BehaviorSubject({ type: 'div' })

      function factory ({ type }) {
        return c('div', null, c(type))
      }

      const src = c(factory, subject)
      const dest = render(src)
      subject.next({ type: 'span' })
      subject.next({ type: 'div' })

      assert.equal(dest.type, 'div')
    })

    it('can rerender on nested observable change', function () {
      function factory () {
        const subject = new BehaviorSubject({
          text: 'text',
          updateText (text) {
            subject.next({ text })
          }
        })

        return c('div', subject)
      }

      const src = c(factory)
      const dest = render(src)
      dest.state.value.updateText('updated text')

      assert.equal(dest.state.value.text, 'updated text')
    })

    it('can rerender on nested observable change if the parent has also changed', function () {
      const outerSubject = new BehaviorSubject(null)

      function factory () {
        const subject = new BehaviorSubject({
          text: 'text',
          updateText (text) {
            subject.next({ text })
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

    it('can rerender on observable change in transcluded components nested in XML components', function () {
      const outerSubject = new BehaviorSubject({ text: 'text' })

      function transcluded (state, children) {
        return c('main', null, ...children)
      }

      function factory ({ text }) {
        return c('div', { text })
      }

      function outerFactory ({ text }) {
        return c('body', null,
          c(transcluded, null,
            c(factory, { text })
          )
        )
      }

      const src = c(outerFactory, outerSubject)
      const dest = render(src)

      outerSubject.next({ text: 'updated text' })

      assert.equal(dest.children[0].children[0].state.value.text, 'updated text')
    })

    it('can add new children to transcluded components nested in XML components', function () {
      const outerSubject = new BehaviorSubject({ text: null })

      function transcluded (state, children) {
        return c('main', null, ...children)
      }

      function factory ({ text }) {
        return c('div', { text })
      }

      function outerFactory ({ text }) {
        return c('body', null,
          c(transcluded, null,
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
