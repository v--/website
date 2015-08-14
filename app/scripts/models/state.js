application.factory('State', ($state, $rootScope) => class State {
    constructor(uiState, params) {
        this.name = uiState.name.replace('code_', '').replace('ianis', 'ianis.js');
        this.url = $state.href(uiState, params) || uiState.url;
        this.children = [];
        this.childrenPromise = null;
        this.active = false;
        this.external = !!uiState.external;
    }

    updateActive(url) {
        if (url === '/')
            this.active = this.url === '/';
        else
            this.active = this.url !== '/' && url.startsWith(this.url);

        if (this.active) {
            if (this.parent)
                $rootScope.$emit('changeTitle', [this.parent.name.capitalize()]);
            else
                $rootScope.$emit('changeTitle', [this.name.capitalize()]);

            if (this.children.isEmpty() && this.childrenPromise)
                this.childrenPromise().then((children) => {
                    this.children = children;
                    this.updateChildren(url);
                    $rootScope.$apply();
                });
        }

        this.updateChildren(url);
    }

    updateChildren(url) {
        for (let child of this.children) {
            child.parent = this;
            child.updateActive(url);
        }
    }
});
