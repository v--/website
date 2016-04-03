import Vector from 'code/core/classes/vector';
import utils from 'code/core/helpers/utils';

const module = {
    continuous(median: number, dispersion: number): number {
        const uniform = Math.random();

        if (uniform < 1 / 2)
            return median + dispersion * Math.log(2 * uniform);

        return median - dispersion * Math.log(2 - 2 * uniform);
    },

    bounded(median: number, dispersion: number): number {
        return utils.clam(this.continuous(median, dispersion), median - dispersion, median + dispersion);
    },

    rounded(median: number, dispersion: number): number {
        return Math.floor(module.bounded(median, dispersion));
    },

    halved(median: number, dispersion: number): number {
        return module.rounded(median, dispersion / 2);
    },

    radial(median: Vector, dispersion: number) {
        return new Vector(module.rounded(median.x, dispersion), module.rounded(median.y, dispersion));
    }
};

export default module;
