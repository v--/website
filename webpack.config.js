/* global process, require, module, __dirname */
/* eslint no-var: 0 */

var plugins = [], babelPlugins = [];

if (process.env.NODE_ENV !== 'production')
    babelPlugins.push('typecheck');

module.exports = {
    bail: true,
    entry: 'code/boot',
    output: {
        filename: 'application.js'
    },
    module: {
        loaders: [
            {
                test: /client\/code/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    plugins: babelPlugins
                }
            },

            {
                test: /client\/views/,
                loader: 'jade'
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jade'],
        alias: {
            code: `${__dirname}/client/code`,
            views: `${__dirname}/client/views`
        }
    },
    plugins: plugins
};
