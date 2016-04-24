module ivasilev.website.routing.router;

import vibe.d;

import ivasilev.settings;
import ivasilev.exception;
import ivasilev.logger;
import ivasilev.models;
import ivasilev.website.helpers;

class Router
{
    import std.array: replaceFirst;
    import std.path: buildPath;
    import std.typecons: scoped;

    private ApplicationSettings settings;

    this(ApplicationSettings settings)
    {
        this.settings = settings;
    }

    @method(HTTPMethod.GET)
    @path("/files/*")
    void files(HTTPServerRequest req, HTTPServerResponse res)
    {
        auto path = buildPath(settings.dirs.files, req.path.replaceFirst("files", settings.dirs.files));
        serveFileOrWebapp(path, req, res);
    }

    @method(HTTPMethod.GET)
    @path("/pacman/*")
    void pacman(HTTPServerRequest req, HTTPServerResponse res)
    {
        auto path = buildPath(settings.dirs.pacman, req.path.replaceFirst("pacman", settings.dirs.pacman));
        serveFileOrWebapp(path, req, res);
    }

    @method(HTTPMethod.GET)
    @path("/slides/:name")
    void slides(HTTPServerRequest req, HTTPServerResponse res)
    {
        FSNameTransformer transformer = path => path;
        auto name = req.params["name"];

        foreach (File file; scoped!Dir(settings.dirs.slides, transformer, 1).files)
        {
            if (Slide.transformFileName(file.name) == name)
            {
                serveFile(file.path, req, res);
                return;
            }
        }

        serveWebapp(req.path, req, res);
    }

    @method(HTTPMethod.GET)
    @path("/docs/*")
    void docs(HTTPServerRequest req, HTTPServerResponse res)
    {
        auto path = buildPath(settings.dirs.docs, req.path.replaceFirst("docs", settings.dirs.docs));
        serveFileOrWebapp(path, req, res);
    }

    @method(HTTPMethod.GET)
    @path("*")
    void wildcard(HTTPServerRequest req, HTTPServerResponse res)
    {
        auto path = buildPath("public", req.path["/".length..$]);
        return serveFileOrWebapp(path, req, res);
    }
}
