const { EmptyIterError, map, reduce } = require('common/support/itertools')

function join(delimiter, iter) {
    try {
        return reduce((value, accum) => `${accum}${delimiter}${value}`, iter, '')
    } catch (e) {
        if (e instanceof EmptyIterError)
            return ''

        throw e
    }
}

function *iterKeyValuePairs(object) {
    for (const [key, value] of Object.entries(object))
        yield `${key}: ${repr(value)}`
}

function serializeObject(object) {
    const guts = join(', ', iterKeyValuePairs(object))

    if (guts)
        return '{ ' + guts + ' }'

    return '{}'
}

/**
 * No interfaces here, since interface implementations use repr
 */
function repr(value) {
    if (typeof value === 'string')
        return `'${value}'`

    if (typeof value === 'function')
        return value.name || 'anonymous'

    if (Object.prototype.toString.call(value) === '[object Array]')
        return '[' + join(', ', map(repr, value)) + ']'

    if (typeof value === 'object' && value !== null && (!('toSting' in value) || value.toString === Object.prototype.toString)) {
        const object = serializeObject(value)

        if (value.constructor === Object)
            return object

        return `${repr(value.constructor)} ${object}`
    }

    return String(value)
}

module.exports = {
    join,
    repr,
    splitURL(url) {
        const [,, route = '', subroute = ''] = url.match(/^\/((\w+)\/?)?(.*)$/)
        return { route, subroute }
    }
}
