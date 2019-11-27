#!/usr/bin/env node

// This is a little hack to make gulp work with ES2015 modules
const patchedRequire = require('esm')(module)
patchedRequire('./gulpfile.mjs')
