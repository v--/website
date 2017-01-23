module ivasilev.website;

import vibe.d;

import ivasilev.logger;
import ivasilev.settings;
import ivasilev.website.routing;
import ivasilev.website.helpers;

void main()
{
    auto appSettings = ApplicationSettings(DEFAULT_CONFIG_FILE);

    auto settings = generateVibedSettings(appSettings);
    auto router = generateVibedRouter(appSettings);

    listenHTTP(settings, router);
    runEventLoop();
}

HTTPServerSettings generateVibedSettings(ApplicationSettings appSettings)
{
    auto result = new HTTPServerSettings;
    result.port = appSettings.server.port;
    result.bindAddresses = [appSettings.server.address];

    result.errorPageHandler = (req, res, error) {
        logger.error("API HTTP error ", error.code);
        res.render!("error.dt", error);
    };

    return result;
}

URLRouter generateVibedRouter(ApplicationSettings appSettings)
{
    auto router = new URLRouter;
    auto api = new URLRouter("/api");

    api.registerRestInterface(new API(appSettings));
    api.get("*", (req, res) { throw new HTTPStatusException(404); });
    router.get("/api/*", api);
    router.registerWebInterface(new Router(appSettings));

    return router;
}
