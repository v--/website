import babelrc from 'babelrc-rollup';
import { join } from 'path';

import nodeResolve from 'rollup-plugin-node-resolve';
import alias from 'rollup-plugin-alias';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import pug from './rollup.plugin.pug';

function absolutize(...segments) {
    return join(__dirname, '..', ...segments);
}

export default function rollupConfigFactory(entry, globals = {}, productionMode, cache) {
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
}
