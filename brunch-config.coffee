exports.config =
  sourceMaps: false

  files:
    javascripts:
      joinTo: 'scripts/application.js'

      order:
        before: [
          'bower_components/traceur-runtime/traceur-runtime.js',
          'bower_components/angular/angular.min.js',
          'bower_components/ianis.js/ianis.min.js',
          'app/scripts/boot.js'
        ]

    stylesheets:
      joinTo: 'styles/application.css'

    templates:
      joinTo: 'scripts/application.js'

  modules:
    definition: false

    nameCleaner: (path) ->
      path.replace(/(app\/(scripts\/)?|\.(js|md|jade))/g, '')

    wrapper: (path, data) ->
      path = exports.config.modules.nameCleaner(path)

      if /reveal\.min\.js/.test path
        return ''

      if /^views/.test path
        jade = data.match(/buf.push\((.*)\);;/) || [];
        markdown = data.match(/".*"/) || [];
        html = jade[1] || markdown[0];
        return """;angular.module("ivasilev").run(function($templateCache) {
          $templateCache.put("#{path}", #{html});
        });"""

      return data

  plugins:
    cleancss:
      keepSpecialComments: 0
