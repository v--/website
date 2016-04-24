module ivasilev.models.file;

import std.file;

import ivasilev.interfaces.json;
import ivasilev.logger;
import ivasilev.models;

class File: FSNode
{
    private immutable
    {
        ulong _size;
        string _actualPath;
    }

    this(DirEntry de, FSNameTransformer transformer)
    {
        super(de, transformer);
        _size = de.size;
        _actualPath = de.name;
    }

    override @property bool isDirectory() {
        return false;
    }

    override @property ulong size() {
        return _size;
    }

    @property string extension() {
        import std.path: extension;
        return name.extension;
    }

    string getContents() {
        logger.info("Reading file ", path);
        return readText(_actualPath);
    }
}
