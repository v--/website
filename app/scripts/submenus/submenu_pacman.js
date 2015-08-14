application.factory('submenuPacman', function(State) {
    return () => new Promise(function(resolve) {
        resolve([
            new State({name: 'any', url: '/pacman/any'}),
            new State({name: 'i686', url: '/pacman/i686'}),
            new State({name: 'x86_64', url: '/pacman/x86_64'})
        ]);
    });
});
