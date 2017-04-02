const pug = require('pug');

const EXT = /\.pug$/;

module.exports = function () {
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
};
