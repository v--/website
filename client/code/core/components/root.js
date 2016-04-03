import Vue from 'vue';

import Page from 'code/core/classes/page';
import CoolError from 'code/core/classes/coolError';
import Navbar from 'code/core/components/navbar';
import ErrorView from 'code/core/views/error';
import views from 'code/core/views/index';
import routes from 'code/core/routes/index';
import browser from 'code/core/helpers/browser';
import template from 'views/core/components/root';

export default Vue.extend({
    name: 'i-root',
    replace: false,
    template: template,
    components: views.map(view => view.component).concat([ErrorView.component, Navbar]),

    data: () => ({
        page: Page.blank
    }),

    computed: {
        component: context => `iv-${context.page.view.name}`
    },

    events: {
        updatePage(path: string) {
            const route = routes.find(route => route.testPath(path));

            if (route === undefined) {
                this.$emit('handleError', CoolError.HTTP.notFound);
                return;
            }

            Promise.all([route.resolve(path), route.resolveChildren(path)])
                .then(response => {
                    const [view, subroutes] = response,
                        subroute = subroutes.find(route => route.testPath(path));

                    if (view === undefined) {
                        this.$emit('handleError', CoolError.HTTP.notFound);
                        return;
                    }

                    return view.resolve(path).then(data => {
                        const page = new Page({ view, route, subroutes, subroute, data: data });
                        browser.updateWindowTitle(view.getTitle(data));
                        this.page = page;
                    });
                });
        },

        updatePath(path: string) {
            if (browser.getPath() !== path)
                browser.pushState(path);

            this.$emit('updatePage', path);
        },

        handleError(error: Error) {
            browser.updateWindowTitle(['error']);
            console.error(error); // eslint-disable-line no-console
            this.page = Page.fromError(error);
        }
    }
});
