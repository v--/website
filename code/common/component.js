const { dup } = require('common/symbols')
const { overloader, bind } = require('common/support/functools')
const { map } = require('common/support/itertools')
const { repr, join } = require('common/support/strtools')
const { IObservable } = require('common/support/observation')
const { CoolError } = require('common/errors')
const Interface = require('common/support/interface')

const htmlVoidTags = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
])

class ComponentCreationError extends CoolError {}
class ComponentSanityError extends ComponentCreationError {}
class InvalidComponentError extends CoolError {}

function *processChildren(children) {
    for (const child of children) {
        if (child instanceof Component)
            yield child
        else if (child)
            throw new InvalidComponentError(`Expected either a component or falsy value as a child, but got ${repr(child)}`)
    }
}

class ComponentState {
    constructor(source, current) {
        this.source = source

        if (current)
            this.current = current
        else if (source instanceof IObservable)
            this.current = source.current
        else if (source instanceof Interface.INull)
            this.current = {}
        else
            this.current = source
    }

    subscribe(observer) {
        if (this.source instanceof IObservable)
            this.source.subscribe(observer)
    }

    unsubscribe(observer) {
        if (this.source instanceof IObservable)
            this.source.unsubscribe(observer)
    }
}

class Component {
    /**
     * Do sanity checks before creating the actual component instance.
     */
    static safeCreate(type, ...args) {
        const stateSource = args.length === 0 ? null : args.shift()
        const children = Array.from(processChildren(args))

        if (!(stateSource instanceof Interface.IObject || stateSource instanceof Interface.INull))
            throw new ComponentCreationError(`Expected either an object or null as an state source, but got ${repr(stateSource)}`)

        if (stateSource instanceof Component)
            throw new ComponentCreationError(`To prevent common errors, components are not allowed as state sources (got ${repr(stateSource)})`)

        const state = new ComponentState(stateSource)
        const component = new this(type, state, children)
        component.checkSanity()
        return component
    }

    constructor(type, state, children) {
        this.type = type
        this.state = state
        this.children = children
    }

    updateState(stateObject) {
        if (!(stateObject instanceof Interface.IObject))
            throw new ComponentSanityError('You can only update the state with an object')

        // Create a temporary component to verify that the new state is sane
        const newState = new ComponentState(this.state.source, stateObject)
        const newComponent = new this.constructor(this.type, newState, this.children)
        newComponent.checkSanity()

        // If everything is fine, update the current state
        this.state.current = stateObject
    }

    [dup]() {
        return new this.constructor(this.type, this.state, this.children)
    }

    toString() {
        const cls = repr(this.constructor)
        const type = repr(this.type)
        const state = repr(this.state.current)

        if (this.children.length) {
            const children = join(',\n\t', map(String, this.children))
            return `${cls}(${type}, ${state},\n\t${children}\n)`
        }

        return `${cls}(${type}, ${state})`
    }

    checkSanity() {}
}

const IXMLComponent = Interface.create({ namespace: Interface.IString })

class XMLComponent extends Component {
    checkSanity() {
        super.checkSanity()
        IXMLComponent.assert(this)

        if (!(this.type instanceof Interface.IString))
            throw new ComponentSanityError(`${repr(this)} must have a string type, not ${repr(this.type)}`)

        if (this.type.length === 0)
            throw new ComponentSanityError(`${repr(this)}'s type string cannot be empty`)

        if ('text' in this.state.current && this.children.length > 0)
            throw new ComponentSanityError(`${repr(this)} cannot have both text and children`)
    }
}

class HTMLComponent extends XMLComponent {
    checkSanity() {
        super.checkSanity()

        if (this.isVoid && this.children.length > 0)
            throw new ComponentSanityError(`${repr(this)} cannot have children`)

        if (this.isVoid && 'text' in this.state.current)
            throw new ComponentSanityError(`${repr(this)} cannot have text`)
    }

    constructor(...args) {
        super(...args)
        this.isVoid = htmlVoidTags.has(this.type)
    }
}

Object.defineProperty(HTMLComponent.prototype, 'namespace', { value: 'http://www.w3.org/1999/xhtml' })

class FactoryComponent extends Component {
    checkSanity() {
        super.checkSanity()

        if (!(this.type instanceof Interface.IFunction))
            throw new ComponentSanityError(`${repr(this)} must have a type function, not ${repr(this.type)}`)
    }

    evaluate() {
        let root = this

        while (root instanceof FactoryComponent) {
            const component = root.type(root.state.current, root.children)

            if (!(component instanceof Component))
                throw new InvalidComponentError(`Expected ${this} to return a component, not ${repr(component)}.`)

            root = component
        }

        return root
    }
}

module.exports = {
    ComponentCreationError,
    ComponentSanityError,
    InvalidComponentError,

    Component,
    ComponentState,
    XMLComponent,
    HTMLComponent,
    FactoryComponent,

    c: overloader(
        {
            iface: Interface.IString,
            impl: bind(HTMLComponent, 'safeCreate')
        },

        {
            iface: Interface.IFunction,
            impl: bind(FactoryComponent, 'safeCreate')
        }
    )
}
