import std.file;
import std.uni;
import std.array;
import std.algorithm.searching;
import std.algorithm.iteration;
import std.regex;
import std.format;
import std.conv;
import std.datetime;
import std.experimental.logger;
import curl = std.net.curl;
import vibe.data.json;
import kxml.xml;
import database;

auto currencyRegex =  ctRegex!("^[a-zA-Z]{3}$");

void sync()
{
    auto documentName = "eurofxref-daily.xml";
    auto now = Clock.currTime().toUTC();
    string document;
    Duration dateDiff;
    Date minDate, maxDate;

    info("Importing the forex database from the ECB");

    try {
        auto extent = connection
                      .createStatement()
                      .executeQuery("SELECT
                        TO_CHAR(MIN(date), 'YYYY-MM-DD'),
                        TO_CHAR(MAX(date), 'YYYY-MM-DD')
                        FROM rate");

        extent.next();
        minDate = extent.getString(1).parseDate;
        maxDate = extent.getString(2).parseDate;
        infof("Date extent in DB: %s - %s", minDate, maxDate);
    }

    catch (TimeException) {}

    dateDiff = Date(now.year(), now.month(), now.day()) - maxDate;

    if (dateDiff > dur !"days" (1) && dateDiff < dur !"days" (90))
    {
        infof("The database has not been updated since %s. Fetching 90-day log", maxDate);
        documentName = "eurofxref-hist-90d.xml";
    }
    else if (dateDiff >= dur !"days" (90))
    {
        infof("The database has not been updated since %s. Fetching full log", maxDate);
        documentName = "eurofxref-hist.xml";
    }

    document = cast(string)curl.get("http://www.ecb.europa.eu/stats/eurofxref/" ~ documentName);
    parseXML(document, minDate, maxDate);
    info("Imported ", documentName);
}

pure Date parseDate(string date)
{
    int year;
    int month;
    int day;

    date.formattedRead("%s-%s-%s", &year, &month, &day);
    return Date(year, month, day);
}

void parseXML(string document, Date minDate, Date maxDate)
{
    auto envelope = readDocument(document);
    auto cubes = envelope.parseXPath("/gesmes:Envelope/Cube/Cube");

    foreach (cube; cubes)
    {
        auto date = cube.getAttribute("time").parseDate();

        if (date < minDate || date > maxDate)
        {
            foreach (node; cube.parseXPath("/Cube"))
            {
                auto currName = node.getAttribute("currency");
                auto currRate = node.getAttribute("rate");
                auto rate = new Rate(currName, parse!double (currRate), date);
                session.save(rate);
            }

            info("Parsed date ", date);
        }

        else
            info("Ignored date ", date);
    }
}

Json get(string currency)
{
    auto result = Json.emptyObject;

    if (currency.matchFirst(currencyRegex).empty)
        return result;

    auto extent = connection
                  .createStatement()
                  .executeQuery("SELECT TO_CHAR(date, 'YYYY-MM-DD'), value FROM rate
                    WHERE currency = '%s' LIMIT 500".format(currency.toUpper));

    while (extent.next())
        result[extent.getString(1)] = extent.getDouble(2);

    return result;
}
