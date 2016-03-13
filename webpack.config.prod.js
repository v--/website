'use strict';

const webpack = require('webpack'),
    webpackConfig = require('./webpack.config.base');

webpackConfig.plugins.push(
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': '"production"'
        }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        compressor: {
            warnings: false
        }
    })
);

module.exports = webpackConfig;
