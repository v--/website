module ivasilev.models.dir;

import std.file;
import std.regex;
import std.path;
import std.algorithm: map, filter;
import std.array: array;
import std.string: startsWith;
import vibe.data.json;

import ivasilev.logger;
import ivasilev.interfaces.json;
import ivasilev.models;

class Dir: FSNode
{
    private
    {
        FSNode[] _children;
        string _markdown;
        ulong _size;
    }

    override @property bool isDirectory()
    {
        return true;
    }

    override @property ulong size()
    {
        return _size;
    }

    @property string markdown()
    {
        return _markdown;
    }

    @property FSNode[] children()
    {
        return _children;
    }

    this(DirEntry de, FSNameTransformer transformer, int availableDepth = -1)
    {
        auto childDepth = availableDepth - (availableDepth > 0 ? 1 : 0);

        super(de, transformer);

        if (availableDepth != 0)
            foreach (entry; dirEntries(de.name, SpanMode.shallow).array)
            {
                auto childName = entry.name.baseName;

                if (childName == ".readme.md")
                {
                    _markdown = readText(entry.name);
                }

                else if (!childName.startsWith("."))
                {
                    if (!entry.isDir)
                        addChild(new File(entry, transformer));
                    else
                        addChild(new Dir(entry, transformer, childDepth));
                }
            }

        else if (exists(buildPath(de.name, ".readme.md")))
            _markdown = readText(buildPath(de.name, ".readme.md"));
    }

    this(string dir, FSNameTransformer FSNameTransformer, int availableDepth = -1)
    {
        this(DirEntry(dir), FSNameTransformer, availableDepth);
    }

    override Json toJSON()
    {
        auto json = FSNode.toJSON;
        json["markdown"] = _markdown;
        json["children"] = Json(_children.map!(node => node.toJSON()).array);
        return json;
    }

    void addChild(FSNode node)
    {
        _children ~= node;
        _size += node.size;
    }

    File[] files()
    {
        return cast(File[]) _children.filter!(node => !node.isDirectory).array;
    }

    Dir[] dirs()
    {
        return cast(Dir[]) _children.filter!(node => node.isDirectory).array;
    }
}
