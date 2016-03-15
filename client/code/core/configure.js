/* globals process */

import 'whatwg-fetch';
import Vue from 'vue';

// Directives
import 'code/core/directives/href';

if (process.env.NODE_ENV !== 'production')
    Vue.config.debug = true;
