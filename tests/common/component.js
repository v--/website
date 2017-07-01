const { expect } = require('tests')

const { bind } = require('common/support/functools')
const { MethodNotImplementedError } = require('common/support/classtools')
const {
    Component,
    XMLComponent,
    HTMLComponent,
    FactoryComponent,
    ComponentCreationError,
    ComponentSanityError,
    InvalidComponentError
} = require('common/component')

describe('Component', function () {
    describe('.safeCreate()', function () {
        it('creates components using only a type', function () {
            const component = Component.safeCreate('div')
            expect(component).to.deep.equal({
                type: 'div',
                options: {},
                children: []
            })
        })

        it('preserves the options object', function () {
            const options = {}
            const component = Component.safeCreate('div', options)
            expect(component.options).to.equal(options)
        })

        it('filters falsy children', function () {
            const child = Component.safeCreate('span')
            const component = Component.safeCreate('div', null, null, undefined, 0, false, '', child)
            expect(component.children).to.have.length(1)
            expect(component.children).to.include(child)
        })

        it('throws if the options is an invalid data type', function () {
            function factory() {
                return Component.safeCreate('div', undefined)
            }

            expect(factory).to.throw(ComponentCreationError)
        })

        it('throws if a non-component truthy child is passed', function () {
            function factory() {
                return Component.safeCreate('div', null, true)
            }

            expect(factory).to.throw(InvalidComponentError)
        })
    })

    describe('.toString()', function () {
        it('works on flat components', function () {
            const component = Component.safeCreate('div')
            expect(String(component)).to.equal("Component('div', {})")
        })

        it('works on nested components', function () {
            const child1 = Component.safeCreate('span', { text: 'text1' })
            const child2 = Component.safeCreate('span', { text: 'text2' })
            const component = Component.safeCreate('div', null, child1, child2)

            const string = `Component('div', {},
\tComponent('span', { text: 'text1' }),
\tComponent('span', { text: 'text2' })
)`

            expect(String(component)).to.equal(string)
        })
    })
})

describe('XMLComponent', function () {
    class SVGComponent extends XMLComponent {
        get namespace() {
            return 'https://www.w3.org/2000/svg'
        }
    }

    describe('.safeCreate()', function () {
        it('throws if no namespace exists in the class', function () {
            function factory() {
                return XMLComponent.safeCreate('div')
            }

            expect(factory).to.throw(MethodNotImplementedError)
        })

        it('succeeds if a namespace exists in the class', function () {
            function factory() {
                return SVGComponent.safeCreate('g')
            }

            expect(factory).to.not.throw(MethodNotImplementedError)
        })

        it('throws if the type is not a string', function () {
            function factory() {
                return SVGComponent.safeCreate(undefined)
            }

            expect(factory).to.throw(ComponentCreationError)
        })

        it('throws if the type string is empty', function () {
            function factory() {
                return SVGComponent.safeCreate('')
            }

            expect(factory).to.throw(ComponentCreationError)
        })

        it('throws if a component has both text and children', function () {
            function factory() {
                const child = SVGComponent.safeCreate('text')
                return SVGComponent.safeCreate('g', { text: 'text' }, child)
            }

            expect(factory).to.throw(ComponentCreationError)
        })
    })
})

describe('HTMLComponent', function () {
    describe('.checkSanity()', function () {
        it('throws if a void component has children', function () {
            function factory() {
                const child = HTMLComponent.safeCreate('span')
                return HTMLComponent.safeCreate('base', null, child)
            }

            expect(factory).to.throw(ComponentSanityError)
        })

        it('throws if a void component has text', function () {
            function factory() {
                return HTMLComponent.safeCreate('base', { text: 'text' })
            }

            expect(factory).to.throw(ComponentSanityError)
        })
    })
})

describe('FactoryComponent', function () {
    describe('.checkSanity()', function () {
        it('throws if the type is not a function', function () {
            function factory() {
                return FactoryComponent.safeCreate(undefined)
            }

            expect(factory).to.throw(ComponentCreationError)
        })
    })

    describe('.evaluate()', function () {
        it('handles simple factories', function () {
            const component = HTMLComponent.safeCreate('div', { text: 'text' })

            function factory({ text }) {
                return HTMLComponent.safeCreate('div', { text })
            }

            const evaluated = FactoryComponent.safeCreate(factory, { 'text': 'text' }).evaluate()
            expect(evaluated).to.equalComponent(component)
        })

        it('handles nested factories', function () {
            const component = HTMLComponent.safeCreate('div', { text: 'text' })

            function subfactory({ text }) {
                return HTMLComponent.safeCreate('div', { text })
            }

            function factory(options) {
                return FactoryComponent.safeCreate(subfactory, options)
            }

            const evaluated = FactoryComponent.safeCreate(factory, { 'text': 'text' }).evaluate()
            expect(evaluated).to.equalComponent(component)
        })

        it("throws if the factory doesn't return a component", function () {
            function factory() {
                return null
            }

            const component = FactoryComponent.safeCreate(factory)
            expect(bind(component, 'evaluate')).to.throw()
        })
    })
})
