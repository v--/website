/* globals require */

import _ from 'lodash';
import page from 'page';

import ErrorComponent from 'code/core/views/errorComponent';
import HTTPError from 'code/core/helpers/httpError';
import NavigationContext from 'code/core/helpers/navigationContext';
import ViewContext from 'code/core/helpers/viewContext';
import mediator from 'code/core/helpers/mediator';
import updateWindowTitle from 'code/core/helpers/updateWindowTitle';
import injectBundles from 'code/core/helpers/injectBundles';

import Home from 'code/core/views/home';
import Files from 'code/core/views/files';
import Code from 'code/core/views/code';
import Slides from 'code/core/views/slides';
import Pacman from 'code/core/views/pacman';
import Docs from 'code/core/views/docs';

const NotFoundError = new HTTPError(404, 'Not Found');

export const VIEWS = [
    Home,
    Files,
    Code,
    Slides,
    Pacman,
    Docs
];

export function startRouter(config: Object) {
    page.start(config);
}

export function go(route: string) {
    page(route);
}

function dispatchView(view, data) {
    const context = new ViewContext(view, data);
    mediator.emit('view:new', context);
}

function dispatchNav(view, subviews, subview) {
    const context = new NavigationContext(view, subviews, subview);
    mediator.emit('nav:new', context);
}

function dispatchError(err) {
    mediator.emit('error', err);
}

mediator.on('error', function (err: Error) {
    const error = ErrorComponent.generate(err);
    dispatchView(error);
    dispatchNav(error);
    updateWindowTitle(['error']);
});

page('*', function (_context, next) {
    next();
});

page('/', function () {
    dispatchView(Home);
    dispatchNav(Home);
    updateWindowTitle(['home']);
});

page('/files', function () {
    Files.resolve().then(function (data) {
        dispatchView(Files, data);
        dispatchNav(Files, Files.subviews(data));
        updateWindowTitle(['files']);
    }).catch(dispatchError);
});

page('/files/*', function (context) {
    Files.resolve().then(function (data) {
        let dir = data.findByPath(decodeURI(context.path)), subviews;

        if (dir === null)
            throw NotFoundError;

        subviews = Files.subviews(data);
        updateWindowTitle(_.map(dir.ancestors, 'name'));
        dispatchView(Files, dir);
        dispatchNav(Files, subviews, _.find(subviews, subview => subview.isSubroute(dir.path)));
    }).catch(dispatchError);
});

page('/code', function () {
    dispatchView(Code, Code.subviews());
    dispatchNav(Code, Code.subviews());
    updateWindowTitle(['code']);
});

page('/code/forex', function () {
    injectBundles('forex').then(function () {
        const Forex = require('code/forex/views/forex').default;
        Forex.resolve().then(function (data) {
            dispatchView(Forex, data);
            dispatchNav(Code, Code.subviews(), Forex);
            updateWindowTitle(['code', 'forex']);
        });
    }).catch(dispatchError);
});

page('/code/sorting', function () {
    injectBundles('sorting').then(function () {
        const Sorting = require('code/sorting/views/sorting').default;
        dispatchView(Sorting);
        dispatchNav(Code, Code.subviews(), Sorting);
        updateWindowTitle(['code', 'sorting']);
    }).catch(dispatchError);
});

page('/code/breakout', function () {
    injectBundles('breakout').then(function () {
        const Breakout = require('code/breakout/views/breakout').default;
        dispatchView(Breakout);
        dispatchNav(Code, Code.subviews(), Breakout);
        updateWindowTitle(['code', 'breakout']);
    }).catch(dispatchError);
});

page('/slides', function () {
    Slides.resolve().then(function (data) {
        dispatchView(Slides, data);
        dispatchNav(Slides);
        updateWindowTitle(['slides']);
    }).catch(dispatchError);
});

page('/pacman', function () {
    Pacman.resolve().then(function (data) {
        dispatchView(Pacman, data);
        dispatchNav(Pacman);
        updateWindowTitle(['pacman']);
    }).catch(dispatchError);
});

page('/docs', function () {
    Docs.resolve().then(function (data) {
        dispatchView(Docs, data);
        dispatchNav(Docs);
        updateWindowTitle(['docs']);
    }).catch(dispatchError);
});

page('*', function () {
    dispatchError(NotFoundError);
});
