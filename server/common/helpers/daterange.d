module ivasilev.helpers.daterange;

import std.datetime;
import ivasilev.exception;

class CoolDateRangeException: CoolException
{
    this(string message)
    {
        super(message);
    }
}

struct DateRange
{
    static DateRange emptyRange;

    private
    {
        bool _empty = true;
        Date _start, _end;

        void enforceNonEmpty()
        {
            if (_empty)
                throw new CoolDateRangeException("Attempted to access an empty date range");
        }
    }

    @property start()
    {
        enforceNonEmpty();
        return _start;
    }

    @property end()
    {
        enforceNonEmpty();
        return _end;
    }

    @property isEmpty()
    {
        return _empty;
    }

    @property extent()
    {
        enforceNonEmpty();
        return end - start;
    }

    @property age()
    {
        enforceNonEmpty();
        return cast(Date) Clock.currTime.toUTC() - end;
    }

    this(Date start, Date end)
    {
        _start = start;
        _end = end;
        _empty = false;
    }

    bool includes(Date date)
    {
        enforceNonEmpty();
        return date >= start && date <= end;
    }
}
