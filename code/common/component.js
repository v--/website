const FortifiedMap = require('common/support/fortified_map');
const { CoolError } = require('common/errors');

const voidTags = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
]);

const svgTags = new Set([
    'altGlyph',
    'altGlyphDef',
    'altGlyphItem',
    'animate',
    'animateColor',
    'animateMotion',
    'animateTransform',
    'circle',
    'clipPath',
    'color-profile',
    'cursor',
    'defs',
    'desc',
    'ellipse',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'filter',
    'font',
    'font-face',
    'font-face-format',
    'font-face-name',
    'font-face-src',
    'font-face-uri',
    'foreignObject',
    'g',
    'glyph',
    'glyphRef',
    'hkern',
    'image',
    'line',
    'linearGradient',
    'marker',
    'mask',
    'metadata',
    'missing-glyph',
    'mpath',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialGradient',
    'rect',
    'script',
    'set',
    'stop',
    'style',
    'svg',
    'switch',
    'symbol',
    'text',
    'textPath',
    'title',
    'tref',
    'tspan',
    'use',
    'view'
]);

class ReactiveMap extends FortifiedMap {
    constructor(source) {
        super(source);
        this.listeners = new Set();
    }

    set(key, value) {
        super.set(key, value);

        for (const listener of this.listeners.values())
            listener();
    }
}

class Component {
    static c(...args)  {
        return new Component(...args);
    }

    constructor(type, options = null, ...children) {
        this.type = type;

        if (options === null)
            this.options = new ReactiveMap(null);
        else
            this.options = new ReactiveMap(Object.entries(options));

        this.children = children.filter(Boolean);
        this.isVoid = voidTags.has(type);
        this.isSVG = svgTags.has(type);

        if (this.isVoid && this.children.length > 0)
            throw new CoolError('Void tags cannot have children.');
    }
}

module.exports = Component;
