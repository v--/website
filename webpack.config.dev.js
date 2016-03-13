'use strict';

const webpackConfig = require('./webpack.config.base'),
    WebpackNotifier = require('webpack-notifier');

webpackConfig.plugins.push(new WebpackNotifier());
module.exports = webpackConfig;
