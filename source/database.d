import std.experimental.logger;
import vibe.data.json;
import hibernated.core;
public import models.rate;

Session session;
Connection connection;
private SessionFactory factory;

void migrate()
{
    info("Migrating the database");
    factory.getDBMetaData().updateDBSchema(connection, true, true);
}

shared static this()
{
    info("Opening the database connection");

    auto schema = new SchemaInfoImpl!(Rate);
    auto driver = new PGSQLDriver();
    auto url = PGSQLDriver.generateUrl("localhost", 5432, "ivasilev");
    auto params = PGSQLDriver.setUserAndPassword("website", "veb");
    auto dialect = new PGSQLDialect();
    auto source = new ConnectionPoolDataSourceImpl(driver, url, params);

    connection = source.getConnection();
    factory = new SessionFactoryImpl(schema, dialect, source);
    session = factory.openSession();
}

shared static ~this()
{
    info("Closing the database connection");
    connection.close();
    factory.close();
    session.close();
}
