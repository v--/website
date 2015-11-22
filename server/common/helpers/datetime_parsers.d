module ivasilev.helpers.datetime_parsers;

import std.datetime;
import std.format;

import ivasilev.exception;

TimeOfDay parseTime(const string timeoid)
{
    int hour, min, sec;
    string input = timeoid.dup;
    try formattedRead(input, "%d:%d:%d", &hour, &min, &sec);
    catch (Exception) throw new CoolException("Could not parse the time string");
    return TimeOfDay(hour, min, sec);
}

Date parseDate(const string dateoid)
{
    int year, month, day;
    string input = dateoid.dup;
    try formattedRead(input, "%d-%d-%d", &year, &month, &day);
    catch (Exception) throw new CoolException("Could not parse the date string");
    return Date(year, month, day);
}
