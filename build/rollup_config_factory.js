const nodeResolve = require('rollup-plugin-node-resolve')
const babelMinify = require('rollup-plugin-babel-minify')
const commonjs = require('rollup-plugin-commonjs')
const alias = require('rollup-plugin-alias')

module.exports = function rollupConfigFactory(entry, productionMode, cache) {
    return {
        entry, cache,

        plugins: [
            alias({
                client: __dirname + '/../code/client',
                common: __dirname + '/../code/common'
            }),
            nodeResolve(),
            commonjs(),
            productionMode && babelMinify({
                comments: false
            })
        ]
    }
}
