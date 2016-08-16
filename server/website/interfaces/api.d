module ivasilev.website.interfaces.api;

import vibe.d;

import ivasilev.settings;
import ivasilev.exception;
import ivasilev.logger;
import ivasilev.models;

interface IAPI
{
    Json getFiles();
    Json getSlides();
    Json getPacman();
    Json getDocs();
}
