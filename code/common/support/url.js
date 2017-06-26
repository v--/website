module.exports = class URL {
    constructor(url) {
        const [,, route = '', subroute = ''] = url.match(/^\/((\w+)\/?)?(.*)$/)
        this.route = route
        this.subroute = subroute
    }
}
