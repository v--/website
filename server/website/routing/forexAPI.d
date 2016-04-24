module ivasilev.website.routing.forex;

import vibe.d;

import ivasilev.settings;
import ivasilev.exception;
import ivasilev.logger;
import ivasilev.models;
import ivasilev.website.interfaces.api;

class ForexAPI
{
    @method(HTTPMethod.GET)
    @path("/currencies")
    Json currencies(HTTPServerRequest req, HTTPServerResponse res) // Cannot remove argument names
    {
        return Json(Rate.getCurrencies().map!Json.array);
    }

    @method(HTTPMethod.GET)
    @path("/rates/:currency")
    Json rates(HTTPServerRequest req, HTTPServerResponse res)
    {
        import std.conv: ConvException, to;
        auto result = Json.emptyObject;
        long limit;

        immutable string currencyName = req.params["currency"],
            limitString = req.query.get("limit");

        if (limitString is null)
            throw new HTTPStatusException(400, "No limit specified");

        try limit = limitString.to!long;
        catch (ConvException)
            throw new HTTPStatusException(400, "Invalid limit");

        if (limit < 0)
            throw new HTTPStatusException(400, "Invalid limit");

        if (!Rate.isValidCurrency(currencyName))
            throw new HTTPStatusException(400, "Invalid currency " ~ currencyName);

        if (limit == 0)
            return Json.emptyObject;

        foreach (rate; Rate.forCurrency(currencyName, limit))
            result[rate.date.toISOExtString()] = rate.value;

        return result;
    }
}
