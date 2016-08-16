module ivasilev.website.routing.api;

import std.algorithm : filter, map;
import std.array : array;
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
}
