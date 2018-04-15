import nodeResolve from 'rollup-plugin-node-resolve'
import babelMinify from 'rollup-plugin-babel-minify'

export default function rollupConfigFactory(input, productionMode, cache) {
    return {
        input, cache,

        plugins: [
            nodeResolve({ // This plugin is only used for allowing rollup to import .mjs files
                extensions: ['.mjs']
            }),
            productionMode && babelMinify({
                comments: false
            })
        ]
    }
}
