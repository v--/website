const Interface = require('common/support/interface')

module.exports = {
    filter(object) {
        const result = {}

        for (const [key, value] of Object.entries(object))
            if (!(value instanceof Interface.IUndefined))
                result[key] = value

        return result
    }
}
