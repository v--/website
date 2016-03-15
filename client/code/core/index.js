import 'code/core/configure';
import Root from 'code/core/components/root';
import spritesheet from 'code/core/helpers/spritesheet';
import browser from 'code/core/helpers/browser';

spritesheet.fetch();

browser.documentReadyResolver().then(function () {
    const root = new Root({ el: document.body });

    window.onunhandledrejection = function onError(e) {
        root.$emit('handleError', e.reason);
    };

    browser.on('error', function (e) {
        root.$emit('handleError', e.error);
    });

    browser.on('popstate', function () {
        root.$emit('updatePage', browser.getPath());
    });

    root.$emit('updatePage', browser.getPath());
});
