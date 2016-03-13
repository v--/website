'use strict';

const fs = require('fs'),
    path = require('path'),
    SplitByPathPlugin = require('webpack-split-by-path');

function absolutize(file) {
    return path.join(__dirname, file);
}

require('./gulpfile.jade'); // Ensure that the Jade plugin uses the patched Jade version

const bundles = fs.readdirSync('client/code');

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
    resolveLoader: {
        alias: {
            "jade": absolutize('./webpack.jade')
        }
    },
    resolve: {
        root: __dirname,
        extensions: ['', '.js', '.jade'],
        alias: {
            code: absolutize('client/code'),
            views: absolutize('client/views')
        }
    },
    plugins: [
        new SplitByPathPlugin([
            { name: 'vendor',    path: absolutize('node_modules') },
            { name: 'templates', path: absolutize('client/views') }
        ].concat(bundles.map(function (bundle) {
            return { name: bundle,  path: absolutize(`client/code/${bundle}`) };
        })))
    ]
};
