export default function classSet(...classes) {
    return classes.compact(true).join(' ');
}
