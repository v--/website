import FSNode from 'code/models/fsNode';
import File from 'code/models/file';

export default class Dir extends FSNode {
    static parseServerResponse = function(res: Object) {
        if (!res.isDirectory)
            return new File(res.path, res.modified, res.size);

        return new Dir(res.path, res.modified, res.size, res.markdown, res.children);
    };

    /* eslint no-cond-assign: 2 */
    get ancestors() {
        let current = this, stack = [];

        do
            stack.push(current);
        while (current = current.parent);

        return stack.reverse();
    }
    /* eslint no-cond-assign: 0 */

    get type() {
        return 'Directory';
    }

    get isDirectory() {
        return true;
    }

    get files() {
        return this.children.filter(x => !x.isDirectory);
    }

    get dirs() {
        return this.children.filter(x => x.isDirectory);
    }

    constructor(path: string, modified: string, size: number, markdown: string, children: Array) {
        super(path, modified, size);
        this.markdown = markdown;
        this.children = [];
        children.map(Dir.parseServerResponse).forEach(::this.addChild);
    }

    findByPath(path: string) {
        if (this.matchesPath(path))
            return this;

        for (const child of this.children) {
            let result;

            if (child.matchesPath(path))
                return child;

            if (child.isDirectory)
                result = child.findByPath(path);

            if (result)
                return result;
        }

        return null;
    }

    addChild(child: FSNode) {
        child.parent = this;
        this.children.push(child);
    }
}
