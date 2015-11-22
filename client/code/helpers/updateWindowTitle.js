/* global document */

export default function updateWindowTitle(subtitles: Array) {
    // document.title does not work with escaped characters
    document.querySelector('title').innerHTML = ['ivasilev.net'].concat(subtitles).join(' &#187; ');
}
