module ivasilev.website;

import vibe.d;

import ivasilev.logger;
import ivasilev.database;
import ivasilev.settings;
import ivasilev.website.router;
import ivasilev.website.helpers;

void main()
{
    auto settings = ApplicationSettings(DEFAULT_CONFIG_FILE);
    DatabaseConnection.renew(settings);
    initializeRouter(settings, generateVibedSettings(settings));
    runEventLoop();
    DatabaseConnection.active.destroy();
}

HTTPServerSettings generateVibedSettings(ApplicationSettings settings)
{
    auto result = new HTTPServerSettings;
    result.port = settings.server.port;
    result.bindAddresses = [settings.server.address];

    result.errorPageHandler = (req, res, error) {
        logger.error("API HTTP error ", error.code);
        res.render!("error.dt", error);
    };

    return result;
}
