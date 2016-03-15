import Page from 'code/core/classes/page';

export default {
    state: {
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
        }
    }
};
