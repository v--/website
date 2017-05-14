const home = require('common/views/home');

const render = require('client/render');

async function stuff() {
    const component = home.component();
    const stuff = render(component);
    const main = document.querySelector('main');

    while (main.firstChild)
        main.removeChild(main.firstChild);

    main.appendChild(stuff);
}

setTimeout(function () {
    stuff().then(Function);
});
