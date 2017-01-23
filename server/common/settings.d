module ivasilev.settings;

import std.conv: to;
import toml.d;

import ivasilev.exception;
import ivasilev.logger;
import ivasilev.helpers.daterange;

enum DEFAULT_CONFIG_FILE = "config.toml";

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

    struct DirectorySettings
    {
        string files, pacman, docs;

        void importTOML(TOMLValue value)
        {

            files = value["files"].str;
            pacman = value["pacman"].str;
            docs = value["docs"].str;
        }
    }

    ServerSettings server;
    DirectorySettings dirs;

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
        dirs.importTOML(config["dirs"]);
    }
}
