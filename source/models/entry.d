import std.file;
import std.algorithm;
import std.array;
import std.regex;
import std.datetime;
import std.path;
import vibe.d;
import vibe.data.json;

abstract class Entry {
    Json entry;

    static string getDate(string path)
    {
        SysTime modified, access;

        getTimes(path, access, modified);
        return modified.toUTC().toISOExtString();
    }

    this(DirEntry de) {
        entry = Json.emptyObject;
        entry.name = baseName(de.name);
        entry.date = getDate(de.name);
        entry.url = "/" ~ de.name;
    }

    alias entry this;
}

class File : Entry {
    static string getExtension(string name)
    {
        return matchFirst(name, `(?<!^\.)(?<=\.)[^/.]+$`)[0];
    }

    this(DirEntry de) {
        super(de);
        entry.size = de.size;
        entry.extension = getExtension(de.name);
    }

    alias entry this;
}

class Dir : Entry {
    void addChild(Entry e)
    {
        entry.children ~= e;
        entry.size += e.size;
    }

    this(DirEntry de) {
        super(de);
        entry.size = 0;
        entry.markdown = "";
        entry.children = Json.emptyArray;

        foreach (child; dirEntries(de.name, SpanMode.shallow).array)
        {
            if (startsWith(baseName(child.name), "."))
                continue;
            else if (endsWith(child.name, "readme.md"))
                entry.markdown = cast(string) read(child.name);
            else
                addChild(child.isDir ? new Dir(child) : new File(child));
        }
    }

    alias entry this;
}
