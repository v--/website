module ivasilev.models.doc;

import std.string: format;
import vibe.data.json;

import ivasilev.interfaces.json;
import ivasilev.models;

class Doc: IJSON
{
    immutable string path, name;

    this(Dir dir)
    {
        name = dir.name;
        path = "%s/index.html".format(dir.path);
    }

    Json toJSON()
    {
        return Json([
            "path": Json(path),
            "name": Json(name)
        ]);
    }
}
