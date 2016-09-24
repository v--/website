import pug from './pug';

const EXT = /\.pug$/;

export default function () {
    return {
        name: 'pug',

        transform (src, id) {
            if ( !EXT.test(id) ) return null;

            const rendered = pug.render(src, { filename: 'client/views' }).replace(/"/g, '\\"').replace(/\n/g, '\\n');

            return {
                code: `export default "${rendered}";`,
                map: { mappings: '' }
            };
        }
    };
}
