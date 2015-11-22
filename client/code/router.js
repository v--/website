import page from 'page';

import ErrorComponent from 'code/views/errorComponent';
import HTTPError from 'code/helpers/httpError';
import NavigationContext from 'code/helpers/navigationContext';
import ViewContext from 'code/helpers/viewContext';
import Dispatcher from 'code/helpers/dispatcher';
import updateWindowTitle from 'code/helpers/updateWindowTitle';

import Home from 'code/views/home';
import Files from 'code/views/files';
import Code from 'code/views/code';
import CodeForex from 'code/views/code/forex';
import CodeSorting from 'code/views/code/sorting';
import Slides from 'code/views/slides';
import Pacman from 'code/views/pacman';

const NotFoundError = new HTTPError(404, 'Not Found');

export const VIEWS = [
    Home,
    Files,
    Code,
    Slides,
    Pacman
];

export function startRouter(config: Object) {
    page.start(config);
}

export function go(route: string) {
    page(route);
}

function dispatchView(view, data) {
    const context = new ViewContext(view, data);
    Dispatcher.view.dispatch(context);
}

function dispatchNav(view, subviews, subview) {
    const context = new NavigationContext(view, subviews, subview);
    Dispatcher.nav.dispatch(context);
}

function dispatchError(err) {
    Dispatcher.error.dispatch(err);
}

Dispatcher.error.register(function(err: Error) {
    const error = ErrorComponent.generate(err);
    dispatchView(error);
    dispatchNav(error);
    updateWindowTitle(['error']);
});

page('*', function(context, next) {
    next();
});

page('/', function() {
    dispatchView(Home);
    dispatchNav(Home);
    updateWindowTitle(['home']);
});

page('/files', function() {
    Files.resolve().then(function(data) {
        dispatchView(Files, data);
        dispatchNav(Files, Files.subviews(data));
        updateWindowTitle(['files']);
    }).catch(dispatchError);
});

page('/files/*', function(context) {
    Files.resolve().then(function(data) {
        let dir = data.findByPath(decodeURI(context.path)), subviews;

        if (dir === null)
            throw NotFoundError;

        subviews = Files.subviews(data);
        updateWindowTitle(dir.ancestors.map('name'));
        dispatchView(Files, dir);
        dispatchNav(Files, subviews, subviews.locate(subview => subview.isSubroute(dir.path)));
    }).catch(dispatchError);
});

page('/code', function() {
    dispatchView(Code, Code.subviews());
    dispatchNav(Code, Code.subviews());
    updateWindowTitle(['code']);
});

page('/code/sorting', function() {
    dispatchView(CodeSorting);
    dispatchNav(Code, Code.subviews(), CodeSorting);
    updateWindowTitle(['code', 'sorting']);
});

page('/code/forex', function() {
    CodeForex.resolve().then(function(data) {
        dispatchView(CodeForex, data);
        dispatchNav(Code, Code.subviews(), CodeForex);
        updateWindowTitle(['code', 'forex']);
    }).catch(dispatchError);
});

page('/slides', function() {
    Slides.resolve().then(function(data) {
        dispatchView(Slides, data);
        dispatchNav(Slides);
        updateWindowTitle(['slides']);
    }).catch(dispatchError);
});

page('/pacman', function() {
    Pacman.resolve().then(function(data) {
        dispatchView(Pacman, data);
        dispatchNav(Pacman);
        updateWindowTitle(['pacman']);
    }).catch(dispatchError);
});

page('*', function() {
    dispatchError(NotFoundError);
});
