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

// No interfaces here, since interface implementations use repr
function repr(value) {
    if (typeof value === 'string')
        return `'${value}'`

    if (value instanceof Function)
        return value.name || 'anonymous'

    if (value instanceof Array)
        return '[' + join(', ', map(repr, value)) + ']'

    if (value instanceof Object && (!('toString' in value) || value.toString === Object.prototype.toString)) {
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
    startsWith(string, substring) {
        return string.substr(0, substring.length) === substring
    },
    splitURL(url) {
        const match = url.match(/^\/((\w+)\/?)?(.*)$/)

        if (match) {
            const [,, route = '', subroute = ''] = match
            return { route, subroute }
        } else {
            return { route: '', subroute: '' }
        }
    }
}
