import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ComponentSanityError } from './errors.ts'
import { HtmlComponent } from './html.ts'

describe('HtmlComponent', function () {
  describe('constructor', function () {
    it('throws if a component has both text and children', function () {
      function factory() {
        const child = new HtmlComponent('text', undefined, [])
        return new HtmlComponent('g', { text: 'text' }, [child])
      }

      assert.throws(factory, ComponentSanityError)
    })

    it('throws if a void component has children', function () {
      function factory() {
        const child = new HtmlComponent('span', undefined, [])
        return new HtmlComponent('base', undefined, [child])
      }

      assert.throws(factory, ComponentSanityError)
    })

    it('throws if a void component has text', function () {
      function factory() {
        return new HtmlComponent('base', { text: 'text' }, [])
      }

      assert.throws(factory, ComponentSanityError)
    })
  })
})
