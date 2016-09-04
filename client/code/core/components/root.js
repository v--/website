import Vue from 'vue';

import Page from 'code/core/classes/page';
import CoolError from 'code/core/classes/cool_error';
import Navbar from 'code/core/components/navbar';
import ErrorView from 'code/core/views/error';
import views from 'code/core/views/index';
import bus from 'code/core/event_bus';
import routes from 'code/core/routes/index';
import template from 'views/core/components/root';
import { mapToObject } from 'code/core/support/misc';
import { factorize } from 'code/core/support/functional';
import { updateWindowTitle, getPath, pushState } from 'code/core/support/browser';

export default Vue.extend({
    template: template,
    components: {
        ...mapToObject(views, view => [view.component.options.name, view.component]),
        ErrorView: ErrorView.component,
        Navbar
    },

    data: factorize({
        page: Page.blank
    }),

    computed: {
        component: context => context.page.view.component.options.name
    },

    methods: {
        updatePage(path) {
            const route = routes.find(route => route.testPath(path));

            if (route === undefined) {
                bus.$emit('handleError', CoolError.HTTP.notFound);
                return;
            }

            Promise.all([route.resolve(path), route.resolveChildren(path)])
                .then(([view, subroutes]) => {
                    const subroute = subroutes.find(route => route.testPath(path));

                    if (view === undefined) {
                        bus.$emit('handleError', CoolError.HTTP.notFound);
                        return;
                    }

                    return view.resolve(path).then(data => {
                        const page = new Page({ view, route, subroutes, subroute, data });
                        updateWindowTitle(view.getTitle(data));
                        Vue.set(this, 'page', page);
                    });
                });
        },

        updatePath(path) {
            if (getPath() !== path)
                pushState(path);

            bus.$emit('updatePage', path);
        },

        handleError(error) {
            pre: error instanceof Error;
            updateWindowTitle(['error']);
            console.error(`${error.name}: ${error.message}`); // eslint-disable-line no-console
            Vue.set(this, 'page', Page.fromError(error));
        }
    },

    mounted() {
        bus.$on('updatePage', this.updatePage);
        bus.$on('updatePath', this.updatePath);
        bus.$on('handleError', this.handleError);
    },

    beforeDestroy() {
        bus.$off('updatePage', this.updatePage);
        bus.$off('updatePath', this.updatePath);
        bus.$off('handleError', this.handleError);
    }
});
