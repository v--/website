module.exports = function (src) {
    const jade = require('./gulpfile.jade');
    return `module.exports="${jade.render(src, { filename: 'client/views' }).replace(/"/g, '\\"').replace(/\n/g, '\\n')}";`;
};
