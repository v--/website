import Vue from 'vue';

import CoolError from 'code/core/classes/cool_error';
import template from 'views/core/components/icon';
import { loadSheet } from 'code/core/support/spritesheet';

export default Vue.extend({
    template: template,

    props: {
        name:           { type: String, required: true },
        title:          { type: String, default: '' },
        rotate:         { type: Number, default: 0 },
        verticalFlip:   { type: Boolean, default: false },
        horizontalFlip: { type: Boolean, default: false }
    },

    data: () => ({
        oldName: null
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
        updateCode(name) {
            Vue.set(this, 'oldName', name);

            loadSheet().then(hash => {
                if (!hash.has(name))
                    throw new CoolError(`Cannot find SVG sprite "${name}"`);

                const node = hash.get(name);
                const clone = node.cloneNode(true);
                const container = this.$el.querySelector('svg');

                while (container.firstChild)
                    container.removeChild(container.firstChild);

                while (clone.firstChild)
                    container.appendChild(clone.firstChild);
            });
        }
    },

    watch: {
        name () {
            this.updateCode(this.name);
        }
    },

    created() {
        if (this.oldName !== this.name)
            this.updateCode(this.name);
    }
});
