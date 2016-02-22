'use strict';

const path = require('path'),
    webpack = require('webpack'),
    WebpackLivereloadPlugin = require('webpack-livereload-plugin'),
    WebpackNotifier = require('webpack-notifier'),
    SplitByPathPlugin = require('webpack-split-by-path');

function absolutize(file) {
    return path.join(__dirname, file);
}

require('./gulpfile.jade'); // Ensure that the Jade plugin uses the patched Jade version

let plugins = [
    new WebpackNotifier(),
    new SplitByPathPlugin([
        { name: 'vendor', path: absolutize('node_modules') },
        { name: 'templates', path: absolutize('client/views') },
        { name: 'core', path: absolutize('client/code/core') },
        { name: 'sorting', path: absolutize('client/code/sorting') },
        { name: 'forex', path: absolutize('client/code/forex') },
        { name: 'breakout', path: absolutize('client/code/breakout') }
    ])
];

if (process.env.NODE_ENV === 'production') {
    plugins.push(
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false,
                minimize: true
            }
        })
    );
} else {
    plugins.push(
        new WebpackLivereloadPlugin()
    );
}

module.exports = {
    devtool: 'source-map',
    entry: absolutize('client/code/core/index'),
    output: {
        path: absolutize('public/code'),
        publicPath: '/code/',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /client\/code/,
                exclude: /node_modules/,
                loader: 'babel'
            },

            {
                test: /client\/views/,
                loader: 'jade'
            }
        ]
    },
    resolve: {
        root: __dirname,
        extensions: ['', '.js', '.jade'],
        alias: {
            code: absolutize('client/code'),
            views: absolutize('client/views')
        }
    },
    plugins: plugins
};
