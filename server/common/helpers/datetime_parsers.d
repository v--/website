module ivasilev.helpers.datetime_parsers;

import std.datetime;
import std.format;
import vibe.data.bson;

import ivasilev.exception;

TimeOfDay parseTime(const string timeoid)
{
    int hour, min, sec;
    string input = timeoid.dup;
    try formattedRead(input, "%d:%d:%d", &hour, &min, &sec);

    catch (Exception e)
        throw new CoolException("Could not parse the time string: " ~ e.msg);

    return TimeOfDay(hour, min, sec);
}

Date parseDate(const string dateoid)
{
    int year, month, day;
    string input = dateoid.dup;
    try formattedRead(input, "%d-%d-%d", &year, &month, &day);

    catch (Exception e)
        throw new CoolException("Could not parse the date string: " ~ e.msg);

    return Date(year, month, day);
}

Date parseDate(const Bson data)
{
    auto date = (cast (BsonDate) data).toSysTime();
    return Date(date.year, date.month, date.day);
}
