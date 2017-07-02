const { expect } = require('tests')

const { CoolError } = require('common/errors')
const { ComponentSanityError } = require('common/component')
const { FactoryRenderer, RenderError, renderDispatcherFactory } = require('common/renderer')
const { bind } = require('common/support/functools')
const MirrorXMLRenderer = require('common/mirror_xml_renderer')
const { map } = require('common/support/itertools')
const { c } = require('common/component')

const render = renderDispatcherFactory(MirrorXMLRenderer, FactoryRenderer)

class SimpleObservable {
    constructor(...objects) {
        if (objects.length === 0)
            throw new CoolError('Nothing to iterate over')

        this.objects = objects[Symbol.iterator]()
        this.default = this.objects.next().value
        this.observers = new Set()
    }

    subscribe(observer) {
        this.observers.add(observer)
    }

    unsubscribe(observer) {
        this.observers.delete(observer)
    }

    trigger() {
        const { value, done } = this.objects.next()

        if (done)
            for (const observer of this.observers)
                observer.complete()
        else
            for (const observer of this.observers)
                observer.next(value)
    }
}

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
            const observable = new SimpleObservable({}, { text: 'text' })
            const src = c('div', observable)
            const dest = render(src)
            observable.trigger()
            expect(dest.state.current.text).to.equal('text')
        })

        it('updates existing properties', function () {
            const observable = new SimpleObservable({ text: 'text' }, { text: 'updated text' })
            const src = c('div', observable)
            const dest = render(src)
            observable.trigger()
            expect(dest.state.current.text).to.equal('updated text')
        })

        it('removes old properties', function () {
            const observable = new SimpleObservable({ text: 'text' }, {})
            const src = c('div', observable)
            const dest = render(src)
            observable.trigger()
            expect(dest.state.current).to.not.have.keys('text')
        })

        it('throws when adding text to an HTML component with children', function () {
            const observable = new SimpleObservable({}, { text: 'text' })
            const src = c('div', observable, c('span'))
            render(src)

            expect(bind(observable, 'trigger')).to.throw(ComponentSanityError)
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
            const observable = new SimpleObservable({ type: 'div' }, { type: 'span' })
            const src = c(({ type }) => c(type), observable)
            render(src)
            expect(bind(observable, 'trigger')).to.throw(RenderError)
        })

        it('adds root children', function () {
            const observable = new SimpleObservable({ add: false }, { add: true })
            const src = c(({ add }) => c('div', null, add && c('span')), observable)
            const dest = render(src)
            observable.trigger()
            expect(dest.children).to.not.be.empty
        })

        it("updates root element's properties", function () {
            const observable = new SimpleObservable({ text: 'text' }, { text: 'updated text' })
            const src = c(({ text }) => c('div', { text }), observable)
            const dest = render(src)
            observable.trigger()
            expect(dest.state.current.text).to.equal('updated text')
        })

        it('replaces root children', function () {
            const observable = new SimpleObservable({ type: 'div' }, { type: 'span' })
            const src = c(({ type }) => c('div', null, c(type)), observable)
            const dest = render(src)
            observable.trigger()
            expect(dest.children[0].type).to.equal('span')
        })

        it('removes root children', function () {
            const observable = new SimpleObservable({ add: true }, { add: false })
            const src = c(({ add }) => c('div', null, add && c('span')), observable)
            const dest = render(src)
            observable.trigger()
            expect(dest.children).to.be.empty
        })

        it('handles swapping', function () {
            const observable = new SimpleObservable(
                { components: ['h1', 'h2', 'h3'] },
                { components: ['h3', 'h2', 'h1'] }
            )

            function factory({ components }) {
                return c('div', null, ...map(c, components))
            }

            const src = c(factory, observable)
            const dest = render(src)
            observable.trigger()

            expect(dest.children.map(child => child.type)).to.deep.equal(['h3', 'h2', 'h1'])
        })

        it('throws when swapping existing elements', function () {
            const h1 = c('h1'), h2 = c('h2'), h3 = c('h3')

            const observable = new SimpleObservable(
                { components: [h1, h2, h3] },
                { components: [h3, h2, h1] }
            )

            function factory({ components }) {
                return c('div', null, ...components)
            }

            const src = c(factory, observable)
            render(src)

            expect(bind(observable, 'trigger')).to.throw(RenderError)
        })

        it('handles nested component swapping', function () {
            const observable = new SimpleObservable(
                { components: ['h1', 'h2', 'h3'] },
                { components: ['h3', 'h2', 'h1'] }
            )

            function factory({ components }) {
                return c('main', null,
                    c('div', null, ...map(c, components))
                )
            }

            const src = c(factory, observable)
            const dest = render(src)
            observable.trigger()

            expect(dest.children[0].children.map(child => child.type)).to.deep.equal(['h3', 'h2', 'h1'])
        })
    })
})
