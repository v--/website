module ivasilev.website.router;

import vibrant.d;

import ivasilev.settings;
import ivasilev.exception;
import ivasilev.logger;
import ivasilev.models;
import ivasilev.website.helpers;

import std.stdio: writeln;

void initializeRouter(ApplicationSettings settings, HTTPServerSettings vibedSettings)
{
    with(Vibrant(vibedSettings))
    {
        import std.array: replaceFirst;
        import std.path: buildPath;
        import std.typecons: scoped;

        Get("/files/*", delegate ubyte[] (req, res) {
            auto path = buildPath(settings.dirs.files, req.path["files/".length..$]);
            return serveFileOrWebapp(path, req, res);
        });

        Get("/pacman/*", delegate ubyte[] (req, res) {
            auto path = buildPath(settings.dirs.pacman, req.path["pacman/".length..$]);
            return serveFileOrWebapp(path, req, res);
        });

        Get("/slides/:name", ContentType.html.utf8, delegate string (req, res) {
            FSNameTransformer transformer = x => x.replaceFirst(settings.dirs.slides, "/slides");
            auto name = req.params["name"];

            foreach (File file; scoped!Dir(settings.dirs.slides, transformer, false).files)
                if (Slide.transformFileName(file.name) == name)
                    return file.getContents();

            throw new HTTPStatusException(400, "Invalid slide " ~ name);
        });

        with(Scope("/api"))
        {
            import std.array: array;

            Get("/files", ContentType.json.utf8, delegate string (req, res) {
                FSNameTransformer transformer = x => x.replaceFirst(settings.dirs.files, "/files");
                return scoped!Dir(settings.dirs.files, transformer).toJSON().toString();
            });

            Get("/slides", ContentType.json.utf8, delegate string (req, res) {
                FSNameTransformer transformer = x => x.replaceFirst(settings.dirs.slides, "/slides");
                return scoped!Dir(settings.dirs.slides, transformer, false)
                    .files
                    .map!(file => scoped!Slide(file).toJSON)
                    .array
                    .Json
                    .toString();
            });

            Get("/forex/currencies", ContentType.json.utf8, delegate string (req, res) {
                return Currency.all.map!(x => x.toJSON).array.Json.toString();
            });

            Get("/forex/rates/:currency", ContentType.json.utf8, delegate string (req, res) {
                long parseLimitString(string limitString)
                {
                    import std.conv: ConvException, to;
                    long limit;

                    if (limitString is null)
                        throw new HTTPStatusException(400, "No limit specified");

                    try limit = limitString.to!long;
                    catch (ConvException)
                        throw new HTTPStatusException(400, "Invalid limit");

                    if (limit < 0)
                        throw new HTTPStatusException(400, "Invalid limit");

                    return limit;
                }

                string rawLimit = req.query.get("limit", null),
                       currencyName = req.params["currency"];

                long limit = parseLimitString(rawLimit);
                auto result = Json.emptyObject;

                if (!Currency.isValidName(currencyName))
                    throw new HTTPStatusException(400, "Invalid currency " ~ currencyName);

                auto currency = Currency.find("name", currencyName.toUpper());

                if (currency is null)
                    throw new HTTPStatusException(400, "Invalid currency " ~ currencyName);

                foreach (rate; Rate.forCurrency(currency, limit))
                    result[rate.date.toISOExtString()] = rate.value;

                return result.toString();
            });

            Get("/pacman", ContentType.json.utf8, delegate string (req, res) {
                FSNameTransformer transformer = x => x.replaceFirst(settings.dirs.pacman, "/pacman");
                return scoped!Dir(settings.dirs.pacman, transformer, false)
                    .files
                    .filter!(file => file.extension == ".xz")
                    .map!(file => scoped!PacmanPackage(file).toJSON)
                    .array
                    .Json
                    .toString();
            });

            Get("*", delegate void (req, res) {
                throw new HTTPStatusException(404);
            });
        }

        Get("*", delegate ubyte[] (req, res) {
            auto path = buildPath("public", req.path["/".length..$]);
            return serveFileOrWebapp(path, req, res);
        });
    }
}
