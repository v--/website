import ReactDOM from 'react-dom';
import { createElement } from 'react';

import Main from 'code/components/main';
import { startRouter } from 'code/router';

document.addEventListener('DOMContentLoaded', function() {
    ReactDOM.render(
        createElement(Main),
        document.querySelector('.preload')
    );

    document.body.removeAttribute('class');
    startRouter({ click: false });
});
