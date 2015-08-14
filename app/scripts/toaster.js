application.run(function($rootScope) {
    let name = 'humane-flatty';
    let toaster = humane.create({'baseCls': name});

    ['info', 'success', 'error'].forEach(function(type) {
        let subToaster = toaster.spawn({
            addnCls: name + '-' + type
        });

        $rootScope.$on('notify:' + type, function(e, message, options) {
            subToaster(message, options);
        });
    });

    $rootScope.$on('notify:clear', function() {
        toaster.remove();
    });

    angular.element(window).on('error', $rootScope.$emit.fill('notify:error', 'An error occured'));
});
