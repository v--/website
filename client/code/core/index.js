// import 'core-js/shim';
// import 'babel-polyfill';

import ReactDOM from 'react-dom';

import Main from 'code/core/components/main';
import { $ } from 'code/core/helpers/component';
import { startRouter } from 'code/core/router';

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(
        $(Main),
        document.querySelector('.preload')
    );

    document.body.removeAttribute('class');
    startRouter({ decodeURLComponents: true, click: false });
});
