import utils from 'code/core/helpers/utils';

const module = {
    get(name: string): string | null {
        if (!navigator.cookieEnabled || document.cookie.length === 0)
            return null;

        return document.cookie.split(';').find(cookie => utils.trim(cookie.split('=')[0]) === name);
    },

    set(name: string, value: string) {
        if (!navigator.cookieEnabled)
            return;

        document.cookie = `${name}=${value}`;
    }
};

export default module;
