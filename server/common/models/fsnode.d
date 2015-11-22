module ivasilev.models.fsnode;

import std.file;
import std.datetime;
import std.path;
import vibe.data.json;

import ivasilev.interfaces.json;

alias FSNameTransformer = string delegate(const string);

abstract class FSNode: IJSON {
    static DateTime getModifiedDate(string path)
    {
        SysTime modified, access;
        getTimes(path, access, modified);
        return cast(DateTime) modified.toUTC();
    }

    immutable
    {
        string path;
        DateTime modified;
    }

    @property name()
    {
        return path.baseName;
    }

    @property bool isDirectory();
    @property ulong size();

    this(DirEntry de, FSNameTransformer transformer)
    {
        path = transformer(de.name);
        modified = getModifiedDate(de.name);
    }

    Json toJSON()
    {
        return Json([
            "size": Json(size),
            "modified": Json(modified.toISOExtString()),
            "isDirectory": Json(isDirectory),
            "path": Json(path)
        ]);
    }
}
