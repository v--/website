import { describe, it, assert } from '../_common.js'

import { c, Component } from '../../code/common/rendering/component.js'
import { dispatcher } from '../../code/server/render_dispatcher.js'
import { join } from '../../code/common/support/strings.js'

function renderToString(component: Component) {
  return join('', dispatcher.render(component))
}

describe('Server-side .render()', function() {
  it('properly renders a br tag', function() {
    const component = c('br')
    assert.equal(renderToString(component), '<br>')
  })

  it('properly renders a blank div tag', function() {
    const component = c('div')
    assert.equal(renderToString(component), '<div></div>')
  })

  it('properly renders a blank div tag with class and style state', function() {
    const component = c('div', { class: 'cool', style: 'background: yellow;' })
    assert.equal(renderToString(component), '<div class="cool" style="background: yellow;"></div>')
  })

  it('properly renders a div tag with a string inside', function() {
    const component = c('div', { text: 'stuff' })
    assert.equal(renderToString(component), '<div>stuff</div>')
  })

  it('properly renders a div with a nested component', function() {
    const component = c('div', undefined, c('span', { text: 'nested' }))
    assert.equal(renderToString(component), '<div><span>nested</span></div>')
  })

  it('properly render a div with multiple nested component', function() {
    const component = c('div', undefined,
      c('span', { text: 'nested1' }),
      c('span', { text: 'nested2' })
    )

    assert.equal(renderToString(component), '<div><span>nested1</span><span>nested2</span></div>')
  })

  it('can render factory components', function() {
    const factory = c(() => c('div'), {})
    const component = renderToString(factory)
    assert.equal(component, '<div></div>')
  })

  it('allows passing state to components', function() {
    const factory = ({ tag }: { tag: string }) => c('div', undefined, c(tag))
    const component = c(factory, { tag: 'span' })
    assert.equal(renderToString(component), '<div><span></span></div>')
  })

  it('properly transcludes components', function() {
    const factory = (_state: unknown, children: TComponents.IComponent[]) => c('div', undefined, ...children)
    const component = c(factory, {}, c('span'))
    assert.equal(renderToString(component), '<div><span></span></div>')
  })
})
