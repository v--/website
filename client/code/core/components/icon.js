import Vue from 'vue';

import CoolError from 'code/core/classes/coolError';
import spritesheet from 'code/core/helpers/spritesheet';
import utils from 'code/core/helpers/utils';
import template from 'views/core/components/icon';

export default Vue.extend({
    name: 'i-icon',
    template: template,

    props: {
        name:    { type: String, required: true },
        title:   { type: String, default: '' },
        rotate:  { type: String, default: null },
        verticalFlip: { type: Boolean, default: false },
        horizontalFlip: { type: Boolean, default: false }
    },

    data: utils.returnsDumbCopy({
        oldName: null,
        code: ''
    }),

    computed: {
        transform: context => {
            let transforms = [];

            if (context.verticalFlip)
                transforms.push('scaleY(-1)');

            if (context.horizontalFlip)
                transforms.push('scaleX(-1)');

            if (context.rotate)
                transforms.push(`rotate(${context.rotate})`);

            return transforms.join(' ');
        }
    },

    methods: {
        updateCode(name: string) {
            this.oldName = name;

            spritesheet.fetch().then(hash => {
                if (!hash.has(name))
                    throw new CoolError(`Cannot find SVG sprite "${name}"`);

                const node = hash.get(name);
                this.code = node.innerHTML;
            });
        }
    },

    watch: {
        name: function () {
            this.updateCode(this.name);
        }
    },

    ready() {
        // throw new Error('p');
        if (this.oldName !== this.name)
            this.updateCode(this.name);
    }
});
