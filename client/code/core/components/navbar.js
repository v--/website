import Vue from 'vue';

import Routes from 'code/core/routes/index';
import Icon from 'code/core/components/icon';
import utils from 'code/core/helpers/utils';
import actions from 'code/core/actions';
import template from 'views/core/components/navbar';

export default Vue.extend({
    name: 'i-navbar',
    template: template,
    components: [Icon],

    data: utils.returnsDumbCopy({
        routes: Routes
    }),

    methods: {
        isActive(route) {
            return !this.hasError && this.page.route && route.path === this.page.route.path;
        },

        toggleExpanded() {
            this.setExpanded(!this.expanded);
        },

        hideNavbar() {
            this.setExpanded(false);
        }
    },

    vuex: {
        getters: {
            hasError: state => state.core.error !== null,
            expanded: state => state.core.expanded,
            page: state => state.core.page
        },

        actions: actions
    }
});
