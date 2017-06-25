const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babili = require('rollup-plugin-babili');
const alias = require('rollup-plugin-alias');

module.exports = function rollupConfigFactory(entry, productionMode, cache) {
    return {
        entry, cache,

        plugins: [
            alias({
                client: __dirname + '/../code/client',
                common: __dirname + '/../code/common',
                framework: __dirname + '/../code/framework'
            }),
            nodeResolve(),
            commonjs(),
            productionMode && babili()
        ]
    };
};
