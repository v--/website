class Node {
    constructor(parent) {
        this.parent = parent
    }

    addSibling(cls) {
        const newChild = new cls(this.parent) // eslint-disable-line new-cap
        this.parent.children.push(newChild)
        return newChild
    }
}

class LeafNode extends Node {
    toJSON() {
        return {
            type: this.constructor.name
        }
    }
}

class LeafTextNode extends LeafNode {
    constructor(parent) {
        super(parent)
        this.text = ''
    }

    toJSON() {
        return {
            type: this.constructor.name,
            text: this.text
        }
    }

    toString() {
        return this.text
    }
}

class NonLeafNode extends Node {
    constructor(parent) {
        super(parent)
        this.children = []
    }

    addChild(cls) {
        const newChild = new cls(this) // eslint-disable-line new-cap
        this.children.push(newChild)
        return newChild
    }

    toJSON() {
        return {
            type: this.constructor.name,
            children: this.children.map(child => child.toJSON())
        }
    }

    toString() {
        return this.children.map(String).join('')
    }
}

class NewlineNode extends LeafNode {
    toString() {
        return '\n'
    }
}

class PlainTextNode extends LeafTextNode {}
class BacktickNode extends LeafTextNode {
    toString() {
        return '`' + super.toString() + '`'
    }
}

class ParenthesisNode extends NonLeafNode {
    toString() {
        return '(' + super.toString() + ')'
    }
}

class BracketNode extends NonLeafNode {
    toString() {
        return '[' + super.toString() + ']'
    }
}

class AsteriskNode extends NonLeafNode {
    toString() {
        return '*' + super.toString() + '*'
    }
}

class RootNode extends NonLeafNode {
    constructor() {
        super(null)
    }
}

function markdown(text) {
    const result = new RootNode()
    let current = result

    for (const char of text)
        switch (current.constructor) {
        case RootNode: {
            switch (char) {
            case '(':
                current = current.addChild(ParenthesisNode)
                break
            case '[':
                current = current.addChild(BracketNode)
                break
            case '*':
                current = current.addChild(AsteriskNode)
                break
            case '`':
                current = current.addChild(BacktickNode)
                break
            case '\n':
                current = current.addChild(NewlineNode)
                break
            default:
                current = current.addChild(PlainTextNode)
                current.text += char
                break
            }

            break
        }

        case NewlineNode: {
            switch (char) {
            case '(':
                current = current.addSibling(ParenthesisNode)
                break
            case '[':
                current = current.addSibling(BracketNode)
                break
            case '*':
                current = current.addSibling(AsteriskNode)
                break
            case '`':
                current = current.addSibling(BacktickNode)
                break
            case '\n':
                current = current.addSibling(NewlineNode)
                break
            default:
                current = current.addSibling(PlainTextNode)
                current.text += char
                break
            }

            break
        }

        case PlainTextNode: {
            switch (char) {
            case '(':
                current = current.addSibling(ParenthesisNode)
                break
            case '[':
                current = current.addSibling(BracketNode)
                break
            case '`':
                current = current.addSibling(BacktickNode)
                break
            case '\n':
                current = current.addSibling(NewlineNode)
                break
            case '*':
                if (current.parent instanceof AsteriskNode)
                    current = current.parent.parent
                else
                    current = current.addSibling(AsteriskNode)
                break
            case ')':
                if (current.parent instanceof ParenthesisNode) {
                    current = current.parent.parent
                    break
                }
            case ']':
                if (current.parent instanceof BracketNode) {
                    current = current.parent.parent
                    break
                }
            default:
                current.text += char
                break
            }

            break
        }

        case ParenthesisNode: {
            switch(char) {
            case ')':
                current = current.parent
                break
            case '(':
                current = current.addSibling(ParenthesisNode)
                break
            case '[':
                current = current.addSibling(BracketNode)
                break
            case '*':
                current = current.addSibling(AsteriskNode)
                break
            case '`':
                current = current.addSibling(BacktickNode)
                break
            default:
                current = current.addChild(PlainTextNode)
                current.text += char
                break
            }

            break
        }

        case BracketNode: {
            switch(char) {
            case ']':
                current = current.parent
                break
            case '(':
                current = current.addSibling(ParenthesisNode)
                break
            case '[':
                current = current.addSibling(BracketNode)
                break
            case '*':
                current = current.addSibling(AsteriskNode)
                break
            case '`':
                current = current.addSibling(BacktickNode)
                break
            default:
                current = current.addChild(PlainTextNode)
                current.text += char
                break
            }

            break
        }

        case AsteriskNode: {
            switch(char) {
            case '*':
                current = current.parent
                break
            case '(':
                current = current.addSibling(ParenthesisNode)
                break
            case '[':
                current = current.addSibling(BracketNode)
                break
            case '`':
                current = current.addSibling(BacktickNode)
                break
            default:
                current = current.addChild(PlainTextNode)
                current.text += char
                break
            }

            break
        }

        case BacktickNode: {
            switch(char) {
            case '`':
                current = current.parent
                break
            default:
                current.text += char
                break
            }

            break
        }
        }

    return result
}

markdown.LeafNode = LeafNode
markdown.LeafTextNode = LeafTextNode
markdown.NonLeafNode = NonLeafNode

markdown.RootNode = RootNode
markdown.NewlineNode = NewlineNode
markdown.BracketNode = BracketNode
markdown.BacktickNode = BacktickNode
markdown.AsteriskNode = AsteriskNode
markdown.PlainTextNode = PlainTextNode
markdown.ParenthesisNode = ParenthesisNode

module.exports = markdown
