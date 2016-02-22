module ivasilev.website.helpers.serve_files;

import std.file;
import vibe.d;

import ivasilev.logger;

private enum WEBAPP_ENTRY = "./views/index.html";

ubyte[] serveFile(string path, HTTPServerRequest, HTTPServerResponse res)
{
    import vibe.inet.mimetypes: getMimeTypeForFile;
    import ivasilev.website.helpers.content_type: utf8;

    if (res !is null)
        res.contentType = getMimeTypeForFile(path).utf8;

    return cast(ubyte[]) read(path);
}

ubyte[] serveWebapp(HTTPServerRequest req, HTTPServerResponse res) {
    return serveFile(WEBAPP_ENTRY, req, res);
}

ubyte[] serveFileOrWebapp(string path, HTTPServerRequest req, HTTPServerResponse res)
{
    if (exists(path) && isFile(path))
    {
        logger.info("Serving requested file ", path);
        return serveFile(path, req, res);
    }

    logger.infof("Requested file %s was not found", path);
    return serveWebapp(req, res);
}
