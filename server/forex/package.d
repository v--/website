module ivasilev.forex;

import curl = std.net.curl;
import kxml.xml;

import ivasilev.database;
import ivasilev.exception;
import ivasilev.logger;
import ivasilev.settings;
import ivasilev.models;
import ivasilev.helpers.daterange;
import ivasilev.helpers.datetime_parsers;

void main()
{
    auto settings = ApplicationSettings(DEFAULT_CONFIG_FILE);
    DatabaseConnection.renew(settings);
    syncRates(settings);
    DatabaseConnection.active.destroy();
}

private:

void syncRates(ApplicationSettings settings)
{
    DateRange dateRange = Rate.queryDateRange();

    if (dateRange.isEmpty)
        logger.info("The forex DB has never been updated");
    else
        logger.infof("The forex DB has not been updated for %s", dateRange.age);

    settings.ecbHistory.getURL(dateRange).fetchRates().importXML(dateRange);
}

string fetchRates(string url)
{
    auto document = curl.get(url);
    logger.infof("Fetched %s", url);
    return cast(string) document;
}

void importXML(string document, DateRange dateRange)
{
    import std.typecons: scoped;
    import std.array: appender;
    import std.conv: to;

    logger.info("Importing the forex database from the ECB");
    auto currencyCache = Currency.indexable;
    auto rateAppender = appender!(Rate[]);

    Currency currencyByName(string name)
    {
        return currencyCache[name] = currencyCache.get(name, Currency.getOrCreate(name));
    }

    foreach (cube; readDocument(document).parseXPath("/gesmes:Envelope/Cube/Cube"))
    {
        import std.string: toUpper;
        auto currentDate = cube.getAttribute("time").parseDate();

        if (!dateRange.isEmpty && dateRange.includes(currentDate))
        {
            logger.info("Ignored date ", currentDate);
            continue;
        }

        foreach (node; cube.parseXPath("/Cube"))
        {
            auto name = node.getAttribute("currency").toUpper();
            auto rate = node.getAttribute("rate").to!double;
            rateAppender.put(new Rate(currencyByName(name), rate, currentDate));
        }

        logger.info("Parsed date ", currentDate);
    }

    Rate.bulkInsert(rateAppender.data);
}
