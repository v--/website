module ivasilev.website.helpers.serve_files;

import std.file;
import vibe.d;

private enum WEBAPP_ENTRY = "./views/application.html";

ubyte[] serveFile(string path, HTTPServerRequest, HTTPServerResponse res)
{
    import vibe.inet.mimetypes: getMimeTypeForFile;
    import ivasilev.website.helpers.content_type: utf8;

    if (res !is null)
        res.contentType = getMimeTypeForFile(path).utf8;

    return cast(ubyte[]) read(path);
}

ubyte[] serveFileOrWebapp(string path, HTTPServerRequest req, HTTPServerResponse res)
{
    if (exists(path) && isFile(path))
        return serveFile(path, req, res);

    return serveWebapp(req, res);
}

ubyte[] serveWebapp(HTTPServerRequest req, HTTPServerResponse res) {
    return serveFile(WEBAPP_ENTRY, req, res);
}
