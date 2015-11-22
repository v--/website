module ivasilev.exception;

class CoolException: Exception
{
    this(T...)(string message, T args)
    {
        import std.string: format;
        super(format(message, args));
    }
}
