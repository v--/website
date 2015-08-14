import std.file;
import std.c.stdlib;
import vibe.d;
import api;
static import database;
static import forex;

URLRouter getRouter()
{
    auto router = new URLRouter;

    router.registerRestInterface(new API(), "api");
    return router;
}

void errorHandler(HTTPServerRequest req, HTTPServerResponse res, HTTPServerErrorInfo error)
{
    res.render!("error/index.dt", error);
}

shared static this()
{
    bool migrate, syncForex;
    readOption("forex", &syncForex, "Whether to update the forex database");
    readOption("migrate", &migrate, "Whether to migrate the database");

    if (migrate)
    {
        database.migrate();
        exit(0);
    }

    if (syncForex)
    {
        forex.sync();
        exit(0);
    }

    auto settings = new HTTPServerSettings;
    settings.port = 8000;
    settings.bindAddresses = ["::1", "127.0.0.1"];
    settings.errorPageHandler = toDelegate(&errorHandler);
    settings.listenHTTP(getRouter());
}
