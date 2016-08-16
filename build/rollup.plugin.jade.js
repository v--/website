import jade from './jade';

const EXT = /\.jade$/;

export default function () {
    return {
        name: 'jade',

        transform (src, id) {
            if ( !EXT.test(id) ) return null;

            const rendered = jade.render(src, { filename: 'client/views' }).replace(/"/g, '\\"').replace(/\n/g, '\\n');

            return {
                code: `export default "${rendered}";`,
                map: { mappings: '' }
            };
        }
    };
}
