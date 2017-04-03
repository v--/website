const babelrc = require('babelrc-rollup').default;
const { join } = require('path');

const nodeResolve = require('rollup-plugin-node-resolve');
const alias = require('rollup-plugin-alias');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');

const pug = require('build/rollup.plugin.pug');

function absolutize(...segments) {
    return join(__dirname, '..', ...segments);
}

module.exports = function rollupConfigFactory(entry, globals = {}, productionMode, cache) {
    return {
        sourceMap: true,
        external: Object.keys(globals),
        entry, globals, cache,

        plugins: [
            alias({
                resolve: ['.js', '.pug'],
                code: absolutize('client', 'code'),
                views: absolutize('client', 'views')
            }),
            pug(),
            babel(Object.assign({
                externalHelpers: false,
                runtimeHelpers: true
                },
                babelrc()
            )),
            nodeResolve(),
            productionMode && uglify({
                compress: {
                    global_defs: {
                        PRODUCTION: productionMode
                    }
                }
            })
        ]
    };
};
