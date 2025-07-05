import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'

import { Component, type IComponentEnvironment, c } from './component.ts'
import { renderToString } from './static_render.ts'
import { MockEnvironment } from '../../testing/unit/mock_environment.ts'

describe('renderToString function', function () {
  let mockEnvironment: MockEnvironment

  beforeEach(async function () {
    mockEnvironment = new MockEnvironment()
  })

  afterEach(async function () {
    await mockEnvironment?.finalize()
  })

  it('properly renders a br tag', async function () {
    const component = c('br')
    const rendered = await renderToString(component, mockEnvironment)
    assert.equal(rendered, '<br>')
  })

  it('properly renders a blank div tag', async function () {
    const component = c('div')
    const rendered = await renderToString(component, mockEnvironment)
    assert.equal(rendered, '<div></div>')
  })

  it('properly renders a blank div tag with class and style state', async function () {
    const component = c('div', { class: 'cool', style: 'background: yellow;' })
    const rendered = await renderToString(component, mockEnvironment)
    assert.equal(rendered, '<div class="cool" style="background: yellow;"></div>')
  })

  it('properly renders a div tag with a string inside', async function () {
    const component = c('div', { text: 'stuff' })
    const rendered = await renderToString(component, mockEnvironment)
    assert.equal(rendered, '<div>stuff</div>')
  })

  it('properly renders a div with a nested component', async function () {
    const component = c('div', undefined, c('span', { text: 'nested' }))
    const rendered = await renderToString(component, mockEnvironment)
    assert.equal(rendered, '<div><span>nested</span></div>')
  })

  it('properly render a div with multiple nested component', async function () {
    const component = c('div', undefined,
      c('span', { text: 'nested1' }),
      c('span', { text: 'nested2' }),
    )

    const rendered = await renderToString(component, mockEnvironment)
    assert.equal(rendered, '<div><span>nested1</span><span>nested2</span></div>')
  })

  it('can render factory components', async function () {
    const factory = c(() => c('div'), {})
    const rendered = await renderToString(factory, mockEnvironment)
    assert.equal(rendered, '<div></div>')
  })

  it('allows passing state to components', async function () {
    interface IState {
      tag: string
    }

    const factory = function ({ tag }: IState) {
      return c('div', undefined, c(tag))
    }

    const component = c(factory, { tag: 'span' })
    const rendered = await renderToString(component, mockEnvironment)
    assert.equal(rendered, '<div><span></span></div>')
  })

  it('properly transcludes components', async function () {
    const factory = function (_state: unknown, env: IComponentEnvironment, children: Component[]) {
      return c('div', undefined, ...children)
    }

    const component = c(factory, {}, c('span'))
    const rendered = await renderToString(component, mockEnvironment)
    assert.equal(rendered, '<div><span></span></div>')
  })
})
