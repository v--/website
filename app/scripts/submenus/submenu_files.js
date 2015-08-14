application.factory('submenuFiles', function(Files, State) {
    return () => new Promise(function(resolve) {
        Files.query(function(files) {
            let submenu = files[0].children
                .filter(entry => !!entry.children)
                .map(entry => new State({name: entry.name, url: entry.url}));

            resolve(submenu);
        });
    });
});
