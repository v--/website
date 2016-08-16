import 'whatwg-fetch';
import Vue from 'vue';

import { DEBUG } from 'code/core/config';
import 'code/core/directives/index';

import Root from 'code/core/components/root';
import { loadSheet } from 'code/core/support/spritesheet';
import { documentReadyResolver, getPath, on } from 'code/core/support/browser';

if (DEBUG)
    Vue.config.debug = true;

loadSheet(); // This is only called here to ensure that the sheets start loading ASAP
documentReadyResolver().then(function () {
    const root = new Root({ el: document.body });

    window.onunhandledrejection = function onError(e) {
        root.$emit('handleError', e.reason);
    };

    on('error', function (e) {
        root.$emit('handleError', e.error);
    });

    on('popstate', function () {
        root.$emit('updatePage', getPath());
    });

    root.$emit('updatePage', getPath());
});
