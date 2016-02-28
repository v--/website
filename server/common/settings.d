module ivasilev.settings;

import std.conv: to;
import toml.d;

import ivasilev.exception;
import ivasilev.logger;
import ivasilev.helpers.daterange;

enum DEFAULT_CONFIG_FILE = "config/config.toml";

struct ApplicationSettings
{
    struct ServerSettings
    {
        string address;
        ushort port;

        void importTOML(TOMLValue value)
        {
            address = value["address"].str;
            port = value["port"].integer.to!ushort;
        }
    }

    struct DatabaseSettings
    {
        string host, name;

        void importTOML(TOMLValue value)
        {
            host = value["host"].str;
            name = value["name"].str;
        }
    }

    struct DirectorySettings
    {
        string files, slides, pacman, docs;

        void importTOML(TOMLValue value)
        {

            files = value["files"].str;
            slides = value["slides"].str;
            pacman = value["pacman"].str;
            docs = value["docs"].str;
        }
    }

    struct ECBHistorySettings
    {
        string daily, quaterly, full;

        void importTOML(TOMLValue value)
        {
            daily = value["daily"].str;
            quaterly = value["quaterly"].str;
            full = value["full"].str;
        }

        string getURL(DateRange dateRange)
        {
            import core.time: dur;
            alias days = dur!"days";

            if (dateRange is null || dateRange.age >= days(90))
            {
                logger.info("Fetching full log");
                return full;
            }

            if (dateRange.age > days(1))
            {
                logger.info("Fetching 90-day log");
                return quaterly;
            }

            logger.info("Fetching the 1-day log");
            return daily;
        }
    }

    ServerSettings server;
    DatabaseSettings db;
    DirectorySettings dirs;
    ECBHistorySettings ecbHistory;

    this(string file)
    {
        logger.info("Reading configuration from file ", file);

        try read(file);

        catch (TOMLException)
            throw new CoolException("Could not parse config file ", file);

        logger.info("Successfully read configuration from file ", file);
    }

    private void read(string file)
    {
        auto config = parseFile(file);
        server.importTOML(config["server"]);
        db.importTOML(config["db"]);
        dirs.importTOML(config["dirs"]);
        ecbHistory.importTOML(config["ecb_history"]);
    }
}
