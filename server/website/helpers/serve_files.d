module ivasilev.website.helpers.serve_files;

import std.file;
import vibe.d;

import ivasilev.logger;

private enum WEBAPP_ENTRY = Path("./views/index.html");

void serveFile(string path, HTTPServerRequest req, HTTPServerResponse res)
{
    logger.info("Serving requested file ", path);
    sendFile(req, res, Path(path));
}

void serveWebapp(string path, HTTPServerRequest req, HTTPServerResponse res)
{
    logger.infof("Requested file %s was not found", path);
    sendFile(req, res, WEBAPP_ENTRY);
}

void serveFileOrWebapp(string path, HTTPServerRequest req, HTTPServerResponse res)
{
    if (exists(path) && isFile(path))
        serveFile(path, req, res);
    else
        serveWebapp(path, req, res);
}
