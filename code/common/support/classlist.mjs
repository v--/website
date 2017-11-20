import { filter } from './iteration'
import { join } from './strings'

export default function classlist(...classes) {
    return join(' ', filter(Boolean, classes))
}
