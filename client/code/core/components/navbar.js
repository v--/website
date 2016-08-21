import Vue from 'vue';

import Page from 'code/core/classes/page';
import Icon from 'code/core/components/icon';
import routes from 'code/core/routes/index';
import template from 'views/core/components/navbar';
import { inGridtMode } from 'code/core/support/browser';
import { factorize } from 'code/core/support/functional';

export default Vue.extend({
    template: template,
    components: { Icon },

    props: {
        page: { page: Page, required: true }
    },

    data: factorize({
        expanded: inGridtMode(),
        routes: routes
    }),

    methods: {
        isActive(route) {
            return this.page.route && route.path === this.page.route.path;
        },

        toggleExpanded() {
            this.expanded = !this.expanded;
        },

        hideNavbar() {
            this.expanded = false;
        }
    }
});
