const home = require('common/views/home');

const ClientRenderer = require('client/renderer');

async function stuff() {
    const component = await home();
    const stuff = new ClientRenderer(component).render();
    const main = document.querySelector('main');

    while (main.firstChild)
        main.removeChild(main.firstChild);

    main.appendChild(stuff);
    component.options.set('text', 'even more stuff');
}

setTimeout(function () {
    stuff().then(Function);
});
