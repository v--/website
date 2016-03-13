'use strict';

const webpackConfig = require('./webpack.config.base'),
    WebpackLivereloadPlugin = require('webpack-livereload-plugin'),
    WebpackNotifier = require('webpack-notifier');

webpackConfig.plugins.push(new WebpackNotifier(), new WebpackLivereloadPlugin());
module.exports = webpackConfig;
