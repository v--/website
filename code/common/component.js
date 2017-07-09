const { overloader, bind } = require('common/support/functions')
const { repr, join } = require('common/support/strings')
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
    for (const child of children)
        if (child instanceof Component)
            yield child
        else if (child)
            throw new InvalidComponentError(`Expected either a component or falsy value as a child, but got ${repr(child)}`)
}

class ComponentState {
    constructor(source, current) {
        this.source = source
        this.updateCurrent(current)
    }

    updateCurrent(current) {
        if (current)
            this.current = current
        else if (this.source instanceof IObservable)
            this.current = this.source.current
        else if (this.source === null)
            this.current = {}
        else
            this.current = this.source
    }

    updateSource(newSource) {
        const oldSource = this.source

        if (newSource === oldSource)
            return

        if (oldSource instanceof IObservable) {
            if (newSource instanceof IObservable)
                for (const observer of oldSource.observers)
                    newSource.observers.add(observer)

            for (const observer of oldSource.observers)
                oldSource.observers.delete(observer)
        }

        this.source = newSource
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

        if (typeof stateSource !== 'object') // Yes, null too
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
        if (!(stateObject instanceof Object))
            throw new ComponentSanityError('You can only update the state with an object')

        // Create a temporary component to verify that the new state is sane
        const newState = new ComponentState(this.state.source, stateObject)
        const newComponent = new this.constructor(this.type, newState, this.children)
        newComponent.checkSanity()

        // If everything is fine, update the current state
        this.state.current = stateObject
    }

    *iterToString() {
        yield repr(this.constructor)
        yield '('
        yield repr(this.type)
        yield ', '
        yield repr(this.state.source === null ? null : this.state.current)

        for (const child of this.children)
            yield `,\n\t${String(child).replace(/\n/g, '\n\t')}`

        if (this.children.length > 0)
            yield '\n'

        yield ')'
    }

    toString() {
        return join('', this.iterToString())
    }

    checkSanity() {}
}

const IXMLComponent = Interface.create({ namespace: Interface.IString })

class XMLComponent extends Component {
    checkSanity() {
        super.checkSanity()
        IXMLComponent.assert(this)

        if (typeof this.type !== 'string')
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

        if (typeof this.type !== 'function')
            throw new ComponentSanityError(`${repr(this)} must have a type function, not ${repr(this.type)}`)
    }

    evaluate() {
        const component = this.type(this.state.current, this.children)

        if (!(component instanceof Component))
            throw new InvalidComponentError(`Expected ${this} to return a component, not ${repr(component)}.`)

        return component
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
            iface: Function,
            impl: bind(FactoryComponent, 'safeCreate')
        }
    )
}
