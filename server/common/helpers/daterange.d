module ivasilev.helpers.daterange;

import std.datetime;
import ivasilev.exception;

class DateRange
{
    private
    {
        Date _start, _end;
    }

    @property start()
    {
        return _start;
    }

    @property end()
    {
        return _end;
    }

    @property extent()
    {
        return end - start;
    }

    @property age()
    {
        return cast(Date) Clock.currTime.toUTC() - end;
    }

    this(Date start, Date end)
    {
        _start = start;
        _end = end;
    }

    bool includes(Date date)
    {
        return date >= start && date <= end;
    }
}
