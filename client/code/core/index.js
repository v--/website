import { Store } from 'vuex';

import 'code/core/configure';
import Root from 'code/core/components/root';
import spritesheet from 'code/core/helpers/spritesheet';
import browser from 'code/core/helpers/browser';
import actions from 'code/core/actions';
import stores from 'code/core/stores';

spritesheet.fetch();

browser.documentReadyResolver().then(function () {
    const store = new Store({ strict: true, modules: stores });

    window.onunhandledrejection = function onError(e) {
        actions.handleError(store, e.reason);
    };

    browser.on('popstate', function () {
        actions.updatePage(store, browser.getPath());
    });

    browser.on('error', function (e) {
        actions.handleError(store, e.error);
    });

    actions.updatePage(store, browser.getPath());
    new Root({ el: document.body, store: store });
});
