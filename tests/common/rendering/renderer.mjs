/* globals describe it */

import { assert } from '../../_common.mjs'

import { c, XMLComponent, FactoryComponent, ComponentSanityError } from '../../../code/common/rendering/component.mjs'
import { XMLRenderer, FactoryRenderer, RenderError, RenderDispatcher } from '../../../code/common/rendering/renderer.mjs'
import { Observable } from '../../../code/common/support/observable.mjs'
import { map } from '../../../code/common/support/iteration.mjs'

export default class MirrorXMLRenderer extends XMLRenderer {
  _createNode () {
    return this.component.constructor.safeCreate(this.component.type, this.component.state.source)
  }

  _setAttribute (key, value) {
    this.element.state.current[key] = value
  }

  _removeAttribute (key, oldValue) { // eslint-disable-line no-unused-vars
    delete this.element.state.current[key]
  }

  _setText () {
    this.element.state.current.text = this.component.state.current.text
  }

  _setHTML () {
    this.element.state.current.html = this.component.state.current.html
  }

  _removeText () {
    delete this.element.state.current.text
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
  describe('.render()', function () {
    it('renders simple components', function () {
      const src = c('div')
      const dest = render(src)
      assert.equalComponents(src, dest)
    })

    it('renders components with state', function () {
      const src = c('div', { a: 0 })
      const dest = render(src)

      assert.equalComponents(src, dest)
    })

    it('renders components with text children', function () {
      const src = c('div', { text: 'text' })
      const dest = render(src)

      assert.equalComponents(src, dest)
    })

    it('renders components with HTML children', function () {
      const src = c('div', null, c('span'), c('span', { text: 'text' }))
      const dest = render(src)

      assert.equalComponents(src, dest)
    })
  })

  describe('.rerender()', function () {
    it('adds new properties', function () {
      const observable = new Observable({})
      const src = c('div', observable)
      const dest = render(src)
      observable.replace({ text: 'text' })
      assert.equal(dest.state.current.text, 'text')
    })

    it('updates existing properties', function () {
      const observable = new Observable({ text: 'text' })
      const src = c('div', observable)
      const dest = render(src)
      observable.replace({ text: 'updated text' })
      assert.equal(dest.state.current.text, 'updated text')
    })

    it('removes old properties', function () {
      const observable = new Observable({ text: 'text' })
      const src = c('div', observable)
      const dest = render(src)
      observable.replace({})
      assert.doesNotHaveAllKeys(dest.state.current, ['text'])
    })

    it('throws when adding text to an HTML component with children', function () {
      const observable = new Observable({})
      const src = c('div', observable, c('span'))
      render(src)

      assert.throws(function () {
        return observable.replace({ text: 'text' })
      }, ComponentSanityError)
    })

    it('can rerender multiple times', function () {
      const observable = new Observable({ text: 'basic' })

      const src = c('div', observable)
      const dest = render(src)
      observable.replace({ text: 'extended' })
      observable.replace({ text: 'premium' })

      assert.equal(dest.state.current.text, 'premium')
    })
  })
})

describe('MirrorFactoryRenderer', function () {
  describe('.render()', function () {
    it('renders constants', function () {
      const constant = render(c('div'))
      const src = c(() => constant)
      const dest = render(src)

      assert.equalComponents(dest, constant)
    })

    it('renders simple text', function () {
      const src = c(({ text }) => c('span', { text }), { text: 'text' })
      const dest = render(src)

      assert.equal(dest.state.current.text, 'text')
    })

    it('throws when attempting to render the same component twice', function () {
      const component = c('span')

      function factory () {
        return c('div', null, component, component)
      }

      assert.throws(render.bind(null, c(factory)), RenderError)
    })
  })

  describe('.rerender()', function () {
    it("throws when trying to replace the root element's type", function () {
      const observable = new Observable({ type: 'div' })
      const src = c(({ type }) => c(type), observable)
      render(src)

      assert.throws(function () {
        return observable.replace({ type: 'span' })
      }, RenderError)
    })

    it('adds root children', function () {
      const observable = new Observable({ add: false })
      const src = c(({ add }) => c('div', null, add && c('span')), observable)
      const dest = render(src)
      observable.replace({ add: true })
      assert.notEmpty(dest.children)
    })

    it("updates root element's properties", function () {
      const observable = new Observable({ text: 'text' })
      const src = c(({ text }) => c('div', { text }), observable)
      const dest = render(src)
      observable.replace({ text: 'updated text' })
      assert.equal(dest.state.current.text, 'updated text')
    })

    it('replaces root children', function () {
      const observable = new Observable({ type: 'div' })
      const src = c(({ type }) => c('div', null, c(type)), observable)
      const dest = render(src)
      observable.replace({ type: 'span' })
      assert.equal(dest.children[0].type, 'span')
    })

    it('removes root children', function () {
      const observable = new Observable({ add: true })
      const src = c(({ add }) => c('div', null, add && c('span')), observable)
      const dest = render(src)
      observable.replace({ add: false })
      assert.empty(dest.children)
    })

    it('handles swapping', function () {
      const observable = new Observable({ components: ['h1', 'h2', 'h3'] })

      function factory ({ components }) {
        return c('div', null, ...map(c, components))
      }

      const src = c(factory, observable)
      const dest = render(src)
      observable.replace({ components: ['h3', 'h2', 'h1'] })

      assert.deepEqual(
        dest.children.map(child => child.type),
        ['h3', 'h2', 'h1']
      )
    })

    it('throws when swapping existing elements', function () {
      const h1 = c('h1')
      const h2 = c('h2')
      const h3 = c('h3')

      const observable = new Observable({ components: [h1, h2, h3] })

      function factory ({ components }) {
        return c('div', null, ...components)
      }

      const src = c(factory, observable)
      render(src)

      assert.throws(function () {
        return observable.replace({ components: [h3, h2, h1] })
      }, RenderError)
    })

    it('handles nested component swapping', function () {
      const observable = new Observable({ components: ['h1', 'h2', 'h3'] })

      function factory ({ components }) {
        return c('main', null,
          c('div', null, ...map(c, components))
        )
      }

      const src = c(factory, observable)
      const dest = render(src)
      observable.replace({ components: ['h3', 'h2', 'h1'] })

      assert.deepEqual(
        dest.children[0].children.map(child => child.type),
        ['h3', 'h2', 'h1']
      )
    })

    it('can rerender multiple times', function () {
      const observable = new Observable({ text: 'basic' })

      function factory ({ text }) {
        return c('span', { text })
      }

      const src = c(factory, observable)
      const dest = render(src)
      observable.replace({ text: 'extended' })
      observable.replace({ text: 'premium' })

      assert.equal(dest.state.current.text, 'premium')
    })

    // BUGFIXES

    it('can rerender multiple with subcomponent replacements', function () {
      const observable = new Observable({ type: 'div' })

      function factory ({ type }) {
        return c('div', null, c(type))
      }

      const src = c(factory, observable)
      const dest = render(src)
      observable.replace({ type: 'span' })
      observable.replace({ type: 'div' })

      assert.equal(dest.type, 'div')
    })

    it('can rerender on nested observable change', function () {
      function factory () {
        const observable = new Observable({
          text: 'text',
          updateText (text) {
            observable.update({ text })
          }
        })

        return c('div', observable)
      }

      const src = c(factory)
      const dest = render(src)
      dest.state.current.updateText('updated text')

      assert.equal(dest.state.current.text, 'updated text')
    })

    it('can rerender on nested observable change if the parent has also changed', function () {
      const outerObservable = new Observable({})

      function factory () {
        const observable = new Observable({
          text: 'text',
          updateText (text) {
            observable.update({ text })
          }
        })

        return c('div', observable)
      }

      const src = c(factory, outerObservable)
      const dest = render(src)

      outerObservable.update({})
      dest.state.current.updateText('updated text')

      assert.equal(dest.state.current.text, 'updated text')
    })

    it('can rerender on observable change in transcluded components nested in XML components', function () {
      const outerObservable = new Observable({ text: 'text' })

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

      const src = c(outerFactory, outerObservable)
      const dest = render(src)

      outerObservable.update({ text: 'updated text' })

      assert.equal(dest.children[0].children[0].state.current.text, 'updated text')
    })

    it('can add new children to transcluded components nested in XML components', function () {
      const outerObservable = new Observable({ text: null })

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

      const src = c(outerFactory, outerObservable)
      const dest = render(src)

      outerObservable.update({ text: 'text' })

      assert.equal(dest.children[0].children[0].state.current.text, 'text')
    })
  })
})
