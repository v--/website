module ivasilev.logger;

import std.stdio : stdout;
import std.experimental.logger : Logger, LogLevel;
import coloredlogger;

Logger logger;

static this() {
    logger = new ColoredLogger(stdout, LogLevel.all);
}

