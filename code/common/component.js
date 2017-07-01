const { dup } = require('common/symbols')
const { overloader, bind } = require('common/support/functools')
const { map } = require('common/support/itertools')
const { repr, join } = require('common/support/strtools')
const { CoolError } = require('common/errors')
const { abstractMethodChecker } = require('common/support/classtools')

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

class Component {
    /**
     * Do sanity checks before creating the actual component instance.
     */
    static safeCreate(type, ...args) {
        const options = args.length === 0 ? null : args.shift()
        const children = Array.from(processChildren(args))

        if (typeof options !== 'object') // Yep, null is allowed too
            throw new ComponentCreationError(`Expected either an object or null as an options object, but got ${repr(options)}`)

        const component = new this(type, options || {}, children)
        component.checkSanity()
        return component
    }

    constructor(type, options, children) {
        this.type = type
        this.options = options
        this.children = children
    }

    [dup](type, options, children) {
        return new this.constructor(type, options, children)
    }

    toString() {
        const cls = repr(this.constructor)
        const type = repr(this.type)
        const options = repr(this.options)

        if (this.children.length) {
            const children = join(',\n\t', map(String, this.children))
            return `${cls}(${type}, ${options},\n\t${children}\n)`
        }

        return `${cls}(${type}, ${options})`
    }

    checkSanity() {}
    destroy() {}
}

class XMLComponent extends Component {
    checkSanity() {
        super.checkSanity()
        abstractMethodChecker(this, ['namespace'])

        if (typeof this.type !== 'string')
            throw new ComponentSanityError(`${repr(this)} must have a string type, not ${repr(this.type)}`)

        if (this.type.length === 0)
            throw new ComponentSanityError(`${repr(this)}'s type string cannot be empty`)

        if ('text' in this.options && this.children.length > 0)
            throw new ComponentSanityError(`${repr(this)} cannot have both text and children`)
    }
}

class HTMLComponent extends XMLComponent {
    checkSanity() {
        super.checkSanity()

        if (this.isVoid && this.children.length > 0)
            throw new ComponentSanityError(`${repr(this)} cannot have children`)

        if (this.isVoid && 'text' in this.options)
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

        if (!(this.type instanceof Function))
            throw new ComponentSanityError(`${repr(this)} must have a type function, not ${repr(this.type)}`)
    }

    evaluate() {
        let root = this

        while (root instanceof FactoryComponent) {
            const component = root.type(root.options, root.children)

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
    XMLComponent,
    HTMLComponent,
    FactoryComponent,

    c: overloader(
        {
            type: 'string',
            impl: bind(HTMLComponent, 'safeCreate')
        },

        {
            type: Function,
            impl: bind(FactoryComponent, 'safeCreate')
        }
    )
}
