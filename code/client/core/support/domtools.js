/* eslint-env browser */

module.exports = {
    onDocumentReady() {
        if (document.readyState === 'complete')
            return Promise.resolve()

        return new Promise(function (resolve) {
            function listener() {
                window.removeEventListener('DOMContentLoaded', listener)
                resolve()
            }

            window.addEventListener('DOMContentLoaded', listener)
        })
    }
}
