module ivasilev.website.helpers.content_type;

enum ContentType
{
    plain = "text/plain",
    json = "application/json",
    html = "text/html"
}

string utf8(string type)
{
    import std.string: format;
    return "%s; charset=UTF-8".format(type);
}
