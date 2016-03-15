import FSNode from 'code/core/models/fsNode';
import File from 'code/core/models/file';

export default class Dir extends FSNode {
    static parseServerResponse = function (res: Object): FSNode {
        const modified = new Date(res.modified);

        if (!res.isDirectory)
            return new File(res.path, modified, res.size);

        return new Dir(res.path, modified, res.size, res.description, res.children.map(Dir.parseServerResponse));
    };

    get type(): string {
        return 'Directory';
    }

    get isDirectory(): boolean {
        return true;
    }

    get files(): File[] {
        return this.children.filter(this.children, child => child.isDirectory);
    }

    get dirs(): Dir[] {
        return this.children.filter(this.children, child => !child.isDirectory);
    }

    get hasDescription(): boolean {
        return this.description !== '';
    }

    get ancestors() {
        let current = this, stack = [];

        do {
            stack.push(current);
            current = current.parent;
        } while (current);

        return stack.reverse();
    }

    constructor(path: string, modified: Date, size: number, description: string, children: FSNode[] = []) {
        super(path, modified, size);
        this.description = description;
        this.children = children;
        children.forEach(child => child.setParent(this));
    }

    findByPath(path: string): Dir | null {
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

    dup() {
        return new Dir(this.path, this.modified, this.size, this.description);
    }
}
