module ivasilev.website.routing.api;

import vibe.d;

import ivasilev.settings;
import ivasilev.exception;
import ivasilev.logger;
import ivasilev.models;
import ivasilev.website.interfaces.api;

class API: IAPI
{
    import std.array: replaceFirst;
    import std.typecons: scoped;

    private ApplicationSettings settings;

    this(ApplicationSettings settings)
    {
        this.settings = settings;
    }

    Json getFiles()
    {
        FSNameTransformer transformer = x => x.replaceFirst(settings.dirs.files, "/files");
        return scoped!Dir(settings.dirs.files, transformer).toJSON();
    }

    Json getSlides()
    {
        FSNameTransformer transformer = x => x.replaceFirst(settings.dirs.slides, "/slides");
        return scoped!Dir(settings.dirs.slides, transformer, 1)
            .files
            .map!(file => scoped!Slide(file).toJSON)
            .array
            .Json();
    }

    Json getPacman()
    {
        FSNameTransformer transformer = x => x.replaceFirst(settings.dirs.pacman, "/pacman");
        return scoped!Dir(settings.dirs.pacman, transformer, 1)
            .files
            .filter!(file => file.extension == ".xz")
            .map!(file => scoped!PacmanPackage(file).toJSON)
            .array
            .Json();
    }

    Json getDocs()
    {
        FSNameTransformer transformer = x => x.replaceFirst(settings.dirs.docs, "/docs");
        return scoped!Dir(settings.dirs.docs, transformer, 1)
            .dirs
            .map!(dir => scoped!Doc(dir).toJSON)
            .array
            .Json();
    }

    string getYomomma()
    {
        import std.net.curl: get;
        auto joke = cast(string) get("http://api.yomomma.info/");
        return parseJson(joke)["joke"].toString()[1..$ - 1];
    }
}
