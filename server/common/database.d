module ivasilev.database;

import vibe.d;

import ivasilev.settings;
import ivasilev.exception;

class DatabaseConnection
{
    static
    {
        DatabaseConnection _active;

        @property DatabaseConnection active()
        {
            if (_active is null)
                throw new CoolException("DatabaseConnection requested but not yet initialized");

            return _active;
        }

        void renew(ApplicationSettings settings)
        {
            import std.string: format;

            if (_active !is null)
                _active.destroy();

            _active = new DatabaseConnection(settings);
        }
    }

    MongoDatabase _db;

    this(ApplicationSettings settings)
    {
        _db = connectMongoDB(settings.db.host).getDatabase(settings.db.name);
    }

    MongoCollection opIndex(string name)
    {
        return _db[name];
    }

    Bson runCommand(T)(T command)
    {
        return _db.runCommand(command);
    }
}
