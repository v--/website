import 'whatwg-fetch';
import Vue from 'vue';

import 'code/core/directives/index';
import { DEBUG } from 'code/core/config';

import { loadSheet } from 'code/core/support/spritesheet';
import { documentReadyResolver, getPath, on } from 'code/core/support/browser';
import bus from 'code/core/event_bus';
import Root from 'code/core/components/root';

if (DEBUG)
    Vue.config.debug = true;

loadSheet(); // This is only called here to ensure that the sheets start loading ASAP
documentReadyResolver().then(function () {
    new Root({ el: document.querySelector('div.root') });

    window.onunhandledrejection = function onError(e) {
        bus.$emit('handleError', e.reason);
    };

    on('error', function (e) {
        e.preventDefault();
        bus.$emit('handleError', e.error);
    });

    on('popstate', function () {
        bus.$emit('updatePage', getPath());
    });

    bus.$emit('updatePage', getPath());
});
