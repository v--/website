module ivasilev.models.currency;

import vibe.data.json;

import ivasilev.database;
import ivasilev.exception;
import ivasilev.interfaces.json;

class Currency: IJSON
{
    mixin ORM!Currency;

    long id;
    string name;

    static bool isValidName(string name)
    {
        import std.regex: matchFirst, ctRegex;
        enum CURRENCY_REGEX =  ctRegex!"^[A-Z]{3}$";
        return !name.matchFirst(CURRENCY_REGEX).empty;
    }

    static Currency getOrCreate(string name)
    {
        auto result = find("name", name);
        if (result !is null) return result;
        result = new Currency(name);
        result.insert();
        return result;
    }

    static Currency[string] indexable()
    {
        Currency[string] result;

        foreach (instance; all)
            result[instance.name] = instance;

        return result;
    }

    this() {}
    this(string name)
    {
        if (!isValidName(name))
            throw new CoolException("Invalid currency name " ~ name);

        this.name = name;
    }

    Json toJSON()
    {
        return Json(name);
    }
}
