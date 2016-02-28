module ivasilev.models.rate;

import std.datetime;
import std.array: array;
import std.algorithm: map;
import vibe.d;

import ivasilev.models;
import ivasilev.database;
import ivasilev.exception;
import ivasilev.interfaces.json;
import ivasilev.interfaces.bson;
import ivasilev.helpers.daterange;
import ivasilev.helpers.datetime_parsers;

class Rate: IJSON, IBSON
{
    static
    {
        bool isValidCurrency(string currency)
        {
            import std.regex: matchFirst, ctRegex;
            enum CURRENCY_REGEX =  ctRegex!"^[A-Z]{3}$";
            return !currency.matchFirst(CURRENCY_REGEX).empty;
        }

        MongoCollection collection()
        {
            return DatabaseConnection.active["rates"];
        }

        string[] getCurrencies()
        {
            return DatabaseConnection
                .active
                .runCommand([
                    "distinct": "rates",
                    "key": "currency"
                ])
                ["values"]
                .deserializeBson!(string[]);
        }

        DateRange queryDateRange()
        {
            auto data = collection.aggregate([
                "$group": [
                    "_id": null,
                    "min": ["$min": "$date"],
                    "max": ["$max": "$date"]
                ]
            ])[0];

            if (data.isNull)
                return null;

            return new DateRange(
                parseDate(data["min"]),
                parseDate(data["max"])
            );
        }

        Rate[] forCurrency(string currency, long limit)
        {
            return collection
                .find([
                    "currency": currency
                ])
                .sort([ "date": -1 ])
                .limit(limit)
                .map!(date => new Rate(
                    date["currency"].get!string,
                    date["value"].get!double,
                    parseDate(date["date"])
                ))
                .array;
        }

    }

    string currency;
    double value;
    Date date;

    this() {}

    this(string currency, double value, Date date)
    {
        import std.string: toUpper;
        this.currency = currency.toUpper();
        this.value = value;
        this.date = date;
    }

    void insert()
    {
        collection.insert(toBSON);
    }

    Bson toBSON()
    {
        return Bson([
            "currency": Bson(currency),
            "date": cast(Bson) BsonDate(date),
            "value": Bson(value)
        ]);
    }

    Json toJSON()
    {
        return Json([
            "currency": Json(currency),
            "date": Json(date.toISOExtString()),
            "value": Json(value)
        ]);
    }
}
