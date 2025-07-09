import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Component, type IComponentEnvironment, createComponent as c } from './component.ts'
import { renderToString } from './static_render.ts'

const TEST_COMPONENT_ENV = {}

describe('renderToString function', function () {
  it('properly renders a br tag', async function () {
    const component = c.html('br')
    const rendered = await renderToString(component, TEST_COMPONENT_ENV)
    assert.equal(rendered, '<br>')
  })

  it('properly renders a blank div tag', async function () {
    const component = c.html('div')
    const rendered = await renderToString(component, TEST_COMPONENT_ENV)
    assert.equal(rendered, '<div></div>')
  })

  it('properly renders a blank div tag with class and style state', async function () {
    const component = c.html('div', { class: 'cool', style: 'background: yellow;' })
    const rendered = await renderToString(component, TEST_COMPONENT_ENV)
    assert.equal(rendered, '<div class="cool" style="background: yellow;"></div>')
  })

  it('properly renders a div tag with a string inside', async function () {
    const component = c.html('div', { text: 'stuff' })
    const rendered = await renderToString(component, TEST_COMPONENT_ENV)
    assert.equal(rendered, '<div>stuff</div>')
  })

  it('properly renders a div with a nested component', async function () {
    const component = c.html('div', undefined, c.html('span', { text: 'nested' }))
    const rendered = await renderToString(component, TEST_COMPONENT_ENV)
    assert.equal(rendered, '<div><span>nested</span></div>')
  })

  it('properly render a div with multiple nested component', async function () {
    const component = c.html('div', undefined,
      c.html('span', { text: 'nested1' }),
      c.html('span', { text: 'nested2' }),
    )

    const rendered = await renderToString(component, TEST_COMPONENT_ENV)
    assert.equal(rendered, '<div><span>nested1</span><span>nested2</span></div>')
  })

  it('can render factory components', async function () {
    const factory = c.factory(() => c.html('div'), {})
    const rendered = await renderToString(factory, TEST_COMPONENT_ENV)
    assert.equal(rendered, '<div></div>')
  })

  it('allows passing state to components', async function () {
    interface IState {
      tag: string
    }

    const factory = function ({ tag }: IState) {
      return c.html('div', undefined, c.html(tag))
    }

    const component = c.factory(factory, { tag: 'span' })
    const rendered = await renderToString(component, TEST_COMPONENT_ENV)
    assert.equal(rendered, '<div><span></span></div>')
  })

  it('properly transcludes components', async function () {
    const factory = function (_state: unknown, env: IComponentEnvironment, children: Readonly<Component[]>) {
      return c.html('div', undefined, ...children)
    }

    const component = c.factory(factory, {}, c.html('span'))
    const rendered = await renderToString(component, TEST_COMPONENT_ENV)
    assert.equal(rendered, '<div><span></span></div>')
  })
})
