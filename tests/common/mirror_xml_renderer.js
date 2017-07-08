const { expect } = require('tests')

const { ComponentSanityError } = require('common/component')
const { FactoryRenderer, RenderError, renderDispatcherFactory } = require('common/renderer')
const { bind } = require('common/support/functools')
const { Observable } = require('common/support/observation')
const MirrorXMLRenderer = require('common/mirror_xml_renderer')
const { map } = require('common/support/itertools')
const { c } = require('common/component')

const render = renderDispatcherFactory(MirrorXMLRenderer, FactoryRenderer)

describe('MirrorXMLRenderer', function () {
    describe('.render()', function () {
        it('renders simple components', function () {
            const src = c('div')
            const dest = render(src)

            expect(src).to.equalComponent(dest)
        })

        it('renders components with state', function () {
            const src = c('div', { a: 0 })
            const dest = render(src)

            expect(src).to.equalComponent(dest)
        })

        it('renders components with text children', function () {
            const src = c('div', { text: 'text'})
            const dest = render(src)

            expect(src).to.equalComponent(dest)
        })

        it('renders components with HTML children', function () {
            const src = c('div', null, c('span'), c('span', { text: 'text' }))
            const dest = render(src)

            expect(src).to.equalComponent(dest)
        })
    })

    describe('.rerender()', function () {
        it('adds new properties', function () {
            const observable = new Observable({})
            const src = c('div', observable)
            const dest = render(src)
            observable.replace({ text: 'text' })
            expect(dest.state.current.text).to.equal('text')
        })

        it('updates existing properties', function () {
            const observable = new Observable({ text: 'text' })
            const src = c('div', observable)
            const dest = render(src)
            observable.replace({ text: 'updated text' })
            expect(dest.state.current.text).to.equal('updated text')
        })

        it('removes old properties', function () {
            const observable = new Observable({ text: 'text' })
            const src = c('div', observable)
            const dest = render(src)
            observable.replace({})
            expect(dest.state.current).to.not.have.keys('text')
        })

        it('throws when adding text to an HTML component with children', function () {
            const observable = new Observable({})
            const src = c('div', observable, c('span'))
            render(src)

            expect(bind(observable, 'replace', { text: 'text' })).to.throw(ComponentSanityError)
        })

        it('can rerender multiple times', function () {
            const observable = new Observable({ text: 'basic' })

            const src = c('div', observable)
            const dest = render(src)
            observable.replace({ text: 'extended' })
            observable.replace({ text: 'premium' })

            expect(dest.state.current.text).to.equal('premium')
        })
    })
})

describe('MirrorFactoryRenderer', function () {
    describe('.render()', function () {
        it('renders constants', function () {
            const constant = render(c('div'))
            const src = c(() => constant)
            const dest = render(src)

            expect(dest).to.equalComponent(constant)
        })

        it('renders simple text', function () {
            const src = c(({ text }) => c('span', { text }), { text: 'text' })
            const dest = render(src)

            expect(dest.state.current.text).to.equal('text')
        })

        it('throws when attempting to render the same component twice', function () {
            const component = c('span')

            function factory() {
                return c('div', null, component, component)
            }

            expect(render.bind(null, c(factory))).to.throw(RenderError)
        })
    })

    describe('.rerender()', function () {
        it("throws when trying to replace the root element's type", function () {
            const observable = new Observable({ type: 'div' })
            const src = c(({ type }) => c(type), observable)
            render(src)
            expect(bind(observable, 'replace', { type: 'span' })).to.throw(RenderError)
        })

        it('adds root children', function () {
            const observable = new Observable({ add: false })
            const src = c(({ add }) => c('div', null, add && c('span')), observable)
            const dest = render(src)
            observable.replace({ add: true })
            expect(dest.children).to.not.be.empty
        })

        it("updates root element's properties", function () {
            const observable = new Observable({ text: 'text' })
            const src = c(({ text }) => c('div', { text }), observable)
            const dest = render(src)
            observable.replace({ text: 'updated text' })
            expect(dest.state.current.text).to.equal('updated text')
        })

        it('replaces root children', function () {
            const observable = new Observable({ type: 'div' })
            const src = c(({ type }) => c('div', null, c(type)), observable)
            const dest = render(src)
            observable.replace({ type: 'span' })
            expect(dest.children[0].type).to.equal('span')
        })

        it('removes root children', function () {
            const observable = new Observable({ add: true })
            const src = c(({ add }) => c('div', null, add && c('span')), observable)
            const dest = render(src)
            observable.replace({ add: false })
            expect(dest.children).to.be.empty
        })

        it('handles swapping', function () {
            const observable = new Observable({ components: ['h1', 'h2', 'h3'] })

            function factory({ components }) {
                return c('div', null, ...map(c, components))
            }

            const src = c(factory, observable)
            const dest = render(src)
            observable.replace({ components: ['h3', 'h2', 'h1'] })

            expect(dest.children.map(child => child.type)).to.deep.equal(['h3', 'h2', 'h1'])
        })

        it('throws when swapping existing elements', function () {
            const h1 = c('h1'), h2 = c('h2'), h3 = c('h3')

            const observable = new Observable({ components: [h1, h2, h3] })

            function factory({ components }) {
                return c('div', null, ...components)
            }

            const src = c(factory, observable)
            render(src)

            expect(bind(observable, 'replace', { components: [h3, h2, h1] })).to.throw(RenderError)
        })

        it('handles nested component swapping', function () {
            const observable = new Observable({ components: ['h1', 'h2', 'h3'] })

            function factory({ components }) {
                return c('main', null,
                    c('div', null, ...map(c, components))
                )
            }

            const src = c(factory, observable)
            const dest = render(src)
            observable.replace({ components: ['h3', 'h2', 'h1'] })

            expect(dest.children[0].children.map(child => child.type)).to.deep.equal(['h3', 'h2', 'h1'])
        })

        it('can rerender multiple times', function () {
            const observable = new Observable({ text: 'basic' })

            function factory({ text }) {
                return c('span', { text })
            }

            const src = c(factory, observable)
            const dest = render(src)
            observable.replace({ text: 'extended' })
            observable.replace({ text: 'premium' })

            expect(dest.state.current.text).to.equal('premium')
        })

        // BUGFIXES

        it('can rerender multiple with subcomponent replacements', function () {
            const observable = new Observable({ type: 'div' })

            function factory({ type }) {
                return c('div', null, c(type))
            }

            const src = c(factory, observable)
            const dest = render(src)
            observable.replace({ type: 'span' })
            observable.replace({ type: 'div' })

            expect(dest.type).to.equal('div')
        })

        it('can rerender on nested observable change', function () {
            function factory() {
                const observable = new Observable({
                    text: 'text',
                    updateText(text) {
                        observable.update({ text })
                    }
                })

                return c('div', observable)
            }

            const src = c(factory)
            const dest = render(src)
            dest.state.current.updateText('updated text')

            expect(dest.state.current.text).to.equal('updated text')
        })

        it('can rerender on nested observable change if the parent has also changed', function () {
            const outerObservable = new Observable({})

            function factory() {
                const observable = new Observable({
                    text: 'text',
                    updateText(text) {
                        observable.update({ text })
                    }
                })

                return c('div', observable)
            }

            const src = c(factory, outerObservable)
            const dest = render(src)

            outerObservable.update({})
            dest.state.current.updateText('updated text')

            expect(dest.state.current.text).to.equal('updated text')
        })

        it('can rerender on observable change in transcluded components nested in XML components', function () {
            const outerObservable = new Observable({ text: 'text' })

            function transcluded(state, children) {
                return c('main', null, ...children)
            }

            function factory({ text }) {
                return c('div', { text })
            }

            function outerFactory({ text }) {
                return c('body', null,
                    c(transcluded, null,
                        c(factory, { text })
                    )
                )
            }

            const src = c(outerFactory, outerObservable)
            const dest = render(src)

            outerObservable.update({ text: 'updated text' })

            expect(dest.children[0].children[0].state.current.text).to.equal('updated text')
        })
    })
})
