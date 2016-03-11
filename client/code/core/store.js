import Page from 'code/core/classes/page';
import cookies from 'code/core/helpers/cookies';
import browser from 'code/core/helpers/browser';

export default {
    state: {
        expanded: browser.inTabletMode() && cookies.get('expanded') !== 'false',
        error: null,
        page: Page.blank
    },

    mutations: {
        UPDATE_PAGE(state: Object, page: Page) {
            state.error = null;
            state.page = page;
        },

        HANDLE_ERROR(state: Object, error: Error) {
            state.error = error;
        },

        UPDATE_EXPANDED(state: Object, value: boolean) {
            state.expanded = value;
        }
    }
};
