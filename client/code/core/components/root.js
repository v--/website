import Vue from 'vue';

import Navbar from 'code/core/components/navbar';
import ErrorComponent from 'code/core/components/error';
import views from 'code/core/views/index';
import template from 'views/core/components/root';

export default Vue.extend({
    name: 'i-root',
    replace: false,
    template: template,
    components: [Navbar, ErrorComponent].concat(views.map(view => view.component)),

    computed: {
        hasError:  context => context.error !== null,
        hasView:   context => context.view !== null,
        component: context => `i-${context.view.name}`
    },

    vuex: {
        getters: {
            error: state => state.core.error,
            view: state => state.core.page.view,
            data: state => state.core.page.data
        }
    }
});
