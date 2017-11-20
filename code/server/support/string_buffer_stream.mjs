import stream from 'stream'

import StringBuffer from '../../common/support/string_buffer'
import { map } from '../../common/support/iteration'

export default class RenderStream extends stream.Readable {
    constructor(iter) {
        super()
        this.buffered = new StringBuffer(map(String, iter))
    }

    _read(maxSize) {
        if (this.buffered.exhausted)
            return

        try {
            const read = this.buffered.read(maxSize)
            this.push(read)

            if (this.buffered.exhausted)
                this.push(null)
        } catch (e) {
            this.emit('error', e)
        }
    }
}
