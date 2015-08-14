import std.file;
import vibe.data.json;
import entry;

Json get(string path = "files")
{
    Json entries = Json.emptyArray;

    entries ~= new Dir(DirEntry(path));

    return entries;
}
