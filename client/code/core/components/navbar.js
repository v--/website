import Vue from 'vue';

import Page from 'code/core/classes/page';
import Icon from 'code/core/components/icon';
import routes from 'code/core/routes/index';
import utils from 'code/core/helpers/utils';
import template from 'views/core/components/navbar';
import browser from 'code/core/helpers/browser';
import cookies from 'code/core/helpers/cookies';

export default Vue.extend({
    name: 'i-navbar',
    template: template,
    components: [Icon],

    props: {
        page: { page: Page, required: true }
    },

    data: () => ({
        expanded: browser.inTabletMode() && cookies.get('expanded') !== 'false',
        routes: utils.dumbCopy(routes)
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
