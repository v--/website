import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/gnome';

function *generator(array) {
    for (let pos = 0; pos < array.length; ) {
        const response = new Algorithm.Response(Math.max(0, pos - 1), pos, pos !== 0 && array[pos - 1] > array[pos]);
        yield response;

        if (response.swap)
            pos--;
        else
            pos++;
    }
}

export default new Algorithm('Gnome sort', template, generator);
