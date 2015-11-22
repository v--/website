module ivasilev.models.pacman_package;

import std.regex;
import vibe.data.json;

import ivasilev.interfaces.json;
import ivasilev.exception;
import ivasilev.models;

enum PACMAN_PACKAGE_REGEX =  ctRegex!`^(.*)-([\d.]+-\d)-(.*).pkg.tar.xz$`;

class PacmanPackage: IJSON {
    string name, ver, arch;

    this(File file)
    {
        import std.array: array;
        auto segments = file.name.matchFirst(PACMAN_PACKAGE_REGEX).array;

        if (segments.length == 0)
            throw new CoolException(file.name ~ " does not appear to be a pacman package");

        name = segments[1];
        ver = segments[2];
        arch = segments[3];
    }

    Json toJSON()
    {
        return Json([
            "name": Json(name),
            "version": Json(ver),
            "arch": Json(arch)
        ]);
    }
}
