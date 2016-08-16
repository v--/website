module ivasilev.website.helpers.serve_files;

import std.file;
import vibe.d;

import ivasilev.logger;

private enum WEBAPP_ENTRY = Path("./views/index.html");

void serveFile(string path, HTTPServerRequest req, HTTPServerResponse res)
{
    sendFile(req, res, Path(path));
}

void serveWebapp(string, HTTPServerRequest req, HTTPServerResponse res)
{
    sendFile(req, res, WEBAPP_ENTRY);
}

void serveFileOrWebapp(string path, HTTPServerRequest req, HTTPServerResponse res)
{
    if (exists(path) && isFile(path))
    {
        logger.tracef("Requested file %s was not found", path);
        serveFile(path, req, res);
    }
    else
    {
        logger.trace("Serving requested file ", path);
        serveWebapp(path, req, res);
    }
}
