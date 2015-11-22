module ivasilev.database.database_connection;

import std.string: format, replace;
import std.variant;
import vibe.data.json;
import ddbc.all;

import ivasilev.exception;
import ivasilev.settings;
import ivasilev.logger;

class DatabaseConnection
{
    private
    {
        string name;
        Connection connection;
        static DatabaseConnection _active;
    }

    static @property active()
    {
        return _active;
    }

    static void renew(ApplicationSettings settings)
    {
        if (_active !is null)
            _active.destroy();

        try _active = new DatabaseConnection(settings);

        catch (Exception)
            throw new CoolException("Could not initialize database ", settings.db.name);
    }

    private this(ApplicationSettings settings)
    {
        name = settings.db.name.dup;
        logger.info("Opening connection to database ", name);

        auto driver = new PGSQLDriver();
        auto source = new ConnectionPoolDataSourceImpl(
            driver,
            PGSQLDriver.generateUrl(settings.db.address, settings.db.port, name),
            PGSQLDriver.setUserAndPassword(settings.db.user, settings.db.pass)
        );

        connection = source.getConnection();
    }

    // As of 2015-11-17 I cannot get neither of the functions in the destructor to work
    ~this()
    {
        logger.info("Closing connection to database ", name);
        connection.close();
    }

    string quoteColumn(string column)
    {
        return `"%s"`.format(column);
    }

    string stringify(T)(T original)
    {
        import std.conv: to;
        import std.datetime: DateTime, Date, TimeOfDay;

        static if (is (T: string))
            return "'%s'".format(original.replace("'", "''"));
        else if (is (T: DateTime) || is(T: Date) || is(T: TimeOfDay))
            return "'%s'".format(original);
        else
            return to!string(original);
    }

    string formatQuery(T...)(string query, T data)
    {
        auto result = query.format(data);
        logger.infof(`Built SQL query "%s"`, result);
        return result;
    }

    ResultSet performQuery(T...)(string query, T data)
    {
        return connection
            .createStatement()
            .executeQuery(formatQuery(query, data));
    }

    Variant performUpdate(T...)(string query, T data)
    {
        Variant result;

        connection
            .createStatement()
            .executeUpdate(formatQuery(query, data), result);

        return result;
    }
}
