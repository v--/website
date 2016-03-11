import Code from 'code/core/views/code';
import Route from 'code/core/classes/route';
import bundles from 'code/core/routes/code/index';

export default new Route({
    name: 'code',
    path: '/code',
    children: bundles,
    resolve(path: string) {
        if (path === '/code')
            return Code;

        const bundle = bundles.find(bundle => bundle.path === path);

        if (bundle !== undefined)
            return bundle.resolve(path);
    }
});

