const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const alias = require('rollup-plugin-alias');

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
