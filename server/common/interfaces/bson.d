module ivasilev.interfaces.bson;

import vibe.data.bson;

interface IBSON
{
    Bson toBSON();
}
