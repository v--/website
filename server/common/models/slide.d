module ivasilev.models.slide;

import std.datetime;
import vibe.data.json;

import ivasilev.interfaces.json;
import ivasilev.models;

class Slide: IJSON
{
    immutable
    {
        string path, name;
    }

    static string transformFileName(string name)
    {
        import std.string: replace, capitalize, toLower;
        import std.path: stripExtension;
        return name.stripExtension.toLower.replace(" ", "_");
    }

    this(File file)
    {
        import std.path: dirName, baseName, buildPath;
        name = file.name.baseName(".html");
        path = buildPath(file.path.dirName, Slide.transformFileName(name));
    }

    Json toJSON()
    {
        return Json([
            "path": Json(path),
            "name": Json(name)
        ]);
    }
}
