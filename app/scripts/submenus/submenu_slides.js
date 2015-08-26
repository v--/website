application.factory('submenuSlides', function(Slide, State) {
    return () => new Promise(function(resolve, reject) {
        Slide.query(function(slides) {
            let states = slides[0].children
                .map(entry => new State({
                    name: entry.name.capitalize().basename('.html').replace(/_/g, ' '),
                    url: 'slides/' + entry.url.basename('.html'),
                    external: true
                })).filter(x => x.name !== ' reveal.jade');

            resolve(states);
        }, reject);
    });
});
