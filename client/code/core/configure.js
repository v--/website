/* globals process */

import 'whatwg-fetch';
import Vue from 'vue';
import Vuex from 'vuex';

// Directives
import 'code/core/directives/href';

Vue.use(Vuex);

if (process.env.NODE_ENV !== 'production')
    Vue.config.debug = true;
