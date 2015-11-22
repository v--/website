module ivasilev.database.orm;

mixin template ORM(CLASS, string SELECTOR = "*")
{
    import std.traits;
    import std.array: array, join;
    import std.string: format, toLower;
    import ddbc.core;

    import ivasilev.database.database_connection;

    enum TABLE_NAME = CLASS.stringof.toLower();

    alias FIELD_TYPES = FieldTypeTuple!CLASS;
    alias FIELD_NAMES = FieldNameTuple!CLASS;

    static @property KEYS()
    {
        string[] fields;

        foreach (i, field; FIELD_NAMES)
            if (field != "id")
                fields ~= DatabaseConnection.active.quoteColumn(field);

        return "(%s)".format(fields.join(',')); // unfortunately, format(%(%s,%)) quotes the strings
    }

    static string stringifyValues(CLASS instance)
    {
        string[] values;

        foreach (i, field; FIELD_NAMES)
            if (field != "id")
                values ~= DatabaseConnection.active.stringify(instance.tupleof[i]);

        return "(%s)".format(values.join(',')); // unfortunately, format(%(%s,%)) quotes the strings
    }

    static CLASS parseResultSet(ResultSet set)
    {
        auto result = new CLASS();

        foreach (i, field; FIELD_NAMES)
            result.tupleof[i] = set.getVariant(field).get!(FIELD_TYPES[i]);

        return result;
    }

    static ResultSet select(T...)(string query, T data)
    {
        auto queryString = "SELECT %s FROM %s".format(SELECTOR, TABLE_NAME);

        if (query.length != 0)
            queryString ~= " " ~ query;

        return DatabaseConnection.active.performQuery(queryString, data);
    }

    static CLASS[] fromQuery(T...)(string query, T data)
    {
        CLASS[] result;
        auto set = select(query, data);
        while (set.next) result ~= parseResultSet(set);
        return result;
    }

    static CLASS singleFromQuery(T...)(string query, T data)
    {
        auto set = select(query, data);
        if (!set.next) return null;
        return parseResultSet(set);
    }

    static CLASS byId(long id)
    {
        return singleFromQuery("WHERE (id=%s) LIMIT 1", id);
    }

    static CLASS find(T)(string field, T condition)
    {
        return singleFromQuery(
            "WHERE (%s=%s) LIMIT 1", field, DatabaseConnection.active.stringify(condition)
        );
    }

    static CLASS[] where(T)(string field, T condition)
    {
        return fromQuery(
            "WHERE (%s=%s)", field, DatabaseConnection.active.stringify(condition)
        );
    }

    static CLASS[] all()
    {
        return fromQuery(null);
    }

    static void insert(CLASS instance)
    {
        import std.variant: Variant;
        Variant id;

        id = DatabaseConnection.active.performUpdate(
            "INSERT INTO %s %s VALUES %s RETURNING id", TABLE_NAME, KEYS, stringifyValues(instance)
        );

        instance.id = id.get!long;
    }

    static void bulkInsert(CLASS[] instances)
    {
        import std.algorithm: map;
        DatabaseConnection.active.performUpdate(
            "INSERT INTO %s %s VALUES %s", TABLE_NAME, KEYS,
            instances.map!(x => stringifyValues(x)).array.join(",")
        );
    }

    static void update(CLASS instance)
    {
        auto connection = DatabaseConnection.active;
        string[] updates;

        foreach (i, field; FIELD_NAMES)
            if (field != "id")
                updates ~= "%s = %s".format(
                    connection.quoteColumn(field),
                    connection.stringify(instance.tupleof[i])
                );

        connection.performUpdate(
            "UPDATE %s SET %s WHERE (id=%d)", TABLE_NAME, updates.join(','), instance.id
        );
    }

    static void remove(long id)
    {
        DatabaseConnection.active.performUpdate("DELETE FROM %s WHERE (id=%d)", TABLE_NAME, id);
    }

    void insert()
    {
        CLASS.insert(this);
    }

    void update()
    {
        CLASS.update(this);
    }

    void remove()
    {
        CLASS.remove(this.id);
    }
}
