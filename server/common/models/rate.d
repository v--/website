module ivasilev.models.rate;

import std.datetime;
import vibe.data.json;

import ivasilev.models;
import ivasilev.database;
import ivasilev.exception;
import ivasilev.interfaces.json;
import ivasilev.helpers.daterange;

class Rate: IJSON
{
    mixin ORM!(Rate, "id, CAST(value AS float), currency_id, date");

    long id;
    long currency_id;
    double value;
    Date date;

    static DateRange queryDateRange()
    {
        auto set = DatabaseConnection.active.performQuery("SELECT * FROM rate_date_extent()");
        if (!set.next) return DateRange.emptyRange;
        return DateRange(set.getDate(1), set.getDate(2));
    }

    static Rate[] forCurrency(Currency currency, long limit)
    {
        return Rate.fromQuery(
            "WHERE (currency_id=%d) ORDER BY date DESC LIMIT %d",
            currency.id,
            limit
        );
    }

    this() {}

    this(Currency currency, double value, Date date)
    {
        this.currency_id = currency.id;
        this.value = value;
        this.date = date;
    }

    Json toJSON()
    {
        return Json([
            "currency": Currency.byId(currency_id).toJSON,
            "data": Json(date.toISOExtString()),
            "value": Json(value)
        ]);
    }
}
