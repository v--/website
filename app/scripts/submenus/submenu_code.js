application.factory('submenuCode', function($state, State) {
    return () => new Promise(function(resolve) {
            let substates = $state.get()
                .filter(substate => substate.url.startsWith('/code/'))
                .map(substate => new State(substate));

            resolve(substates);
        });
});
