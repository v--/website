import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ComponentSanityError, InvalidComponentError } from './errors.ts'
import { createComponent as c } from './sugar.ts'
import { assertFalse, assertUndefined } from '../../../testing/assertion.ts'
import { dedent } from '../../support/dedent.ts'

describe('c function', function () {
  it('creates components using only a type', async function () {
    const component = c.html('div')
    assert.equal(component.type, 'div')
    assertFalse(component.hasChildren())
    assertUndefined(await component.getState())
  })

  it('preserves the state object', async function () {
    const state = {}
    const component = c.html('div', state)
    assert.deepEqual(await component.getState(), state)
  })

  it('filters falsy children', function () {
    const child = c.html('span')
    const component = c.html('div', undefined, undefined, undefined, undefined, 0, false, '', child)

    const children = Array.from(component.iterChildren())
    assert.equal(children.length, 1)
    assert.equal(children[0], child)
  })

  it('throws if the state has an invalid type', function () {
    function factory() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state: any = 3
      return c.html('div', state)
    }

    assert.throws(factory, ComponentSanityError)
  })

  it('throws if a non-component truthy child is passed', function () {
    function factory() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const children: any[] = [true]
      return c.html('div', undefined, ...children)
    }

    assert.throws(factory, InvalidComponentError)
  })
})

describe('as an invese of XMLComponent.toString()', function () {
  it('works on flat components', function () {
    const string = "c.html('div')"
    // eslint-disable-next-line no-eval
    const component = eval(string)
    assert.equal(String(component), string)
  })

  it('works on nested components', function () {
    const string = dedent(`\
        c.html('div', undefined,
          c.html('span', { text: 'text1' }),
          c.html('span', { text: 'text2' })
        )`,
    )

    // eslint-disable-next-line no-eval
    const component = eval(string)
    assert.equal(String(component), string)
  })

  it('works on doubly nested components', function () {
    const string = dedent(`\
        c.html('div', undefined,
          c.html('span', { label: 'outer' },
            c.html('span', { label: 'inner' })
          )
        )`,
    )

    // eslint-disable-next-line no-eval
    const component = eval(string)
    assert.equal(String(component), string)
  })
})
