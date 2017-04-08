const nodeResolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');

module.exports = function rollupConfigFactory(entry, productionMode, cache) {
    return {
        sourceMap: true,
        entry, cache,

        plugins: [
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
