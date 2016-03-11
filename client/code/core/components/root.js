import Vue from 'vue';

import Navbar from 'code/core/components/navbar';
import ErrorComponent from 'code/core/components/error';
import utils from 'code/core/helpers/utils';
import views from 'code/core/views/index';
import template from 'views/core/components/root';

export default Vue.extend({
    replace: false,
    template: template,

    components: Object.assign(utils.mapObject(views, view => `i-${view.name}`, view => view.component), {
        'i-navbar': Navbar,
        'i-error': ErrorComponent
    }),

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
