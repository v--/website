import Vue from 'vue';

import Page from 'code/core/classes/page';
import Icon from 'code/core/components/icon';
import routes from 'code/core/routes/index';
import template from 'views/core/components/navbar';
import { inTabletMode } from 'code/core/support/browser';
import { dumbCopy } from 'code/core/support/misc';

export default Vue.extend({
    name: 'i-navbar',
    template: template,
    components: [Icon],

    props: {
        page: { page: Page, required: true }
    },

    data: () => ({
        expanded: inTabletMode(),
        routes: dumbCopy(routes)
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
