application.filter('fileType', function() {
    return function(type) {
        switch (type) {
            case undefined: return 'Directory';
            case '': return 'Dotfile';
            default: return type.toUpperCase();
        }
    };
});
