/* globals describe it */

import { expect } from '../_common.mjs'

import { c } from '../../code/common/rendering/component.mjs'
import dispatcher from '../../code/server/render_dispatcher.mjs'

function renderToString (component) {
  return Array.from(dispatcher.render(component)).join('')
}

describe('Server-side .render()', function () {
  it('properly renders a br tag', function () {
    const component = c('br')
    expect(renderToString(component)).to.equal('<br>')
  })

  it('properly renders a blank div tag', function () {
    const component = c('div')
    expect(renderToString(component)).to.equal('<div></div>')
  })

  it('properly renders a blank div tag with class and style state', function () {
    const component = c('div', { class: 'cool', style: 'background: yellow;' })
    expect(renderToString(component)).to.equal('<div class="cool" style="background: yellow;"></div>')
  })

  it('properly renders a div tag with a string inside', function () {
    const component = c('div', { text: 'stuff' })
    expect(renderToString(component)).to.equal('<div>stuff</div>')
  })

  it('properly renders a div with a nested component', function () {
    const component = c('div', null, c('span', { text: 'nested' }))
    expect(renderToString(component)).to.equal('<div><span>nested</span></div>')
  })

  it('properly render a div with multiple nested component', function () {
    const component = c('div', null,
      c('span', { text: 'nested1' }),
      c('span', { text: 'nested2' })
    )

    expect(renderToString(component)).to.equal('<div><span>nested1</span><span>nested2</span></div>')
  })

  it('can render factory components', function () {
    const factory = c(() => c('div'))
    const component = renderToString(factory)
    expect(component).to.equal('<div></div>')
  })

  it('allows passing state to components', function () {
    const factory = ({ tag }) => c('div', null, c(tag))
    const component = c(factory, { tag: 'span' })
    expect(renderToString(component)).to.equal('<div><span></span></div>')
  })

  it('properly transcludes components', function () {
    const factory = (state, children) => c('div', null, ...children)
    const component = c(factory, null, c('span'))
    expect(renderToString(component)).to.equal('<div><span></span></div>')
  })
})
