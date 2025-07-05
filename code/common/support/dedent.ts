function countSpacePrefix(line: string) {
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== ' ') {
      return i
    }
  }

  return Number.POSITIVE_INFINITY
}

export function dedent(source: string): string {
  const lines = source.split('\n')
  const minPrefixLength = Math.min(...lines.map(countSpacePrefix))
  return lines.map(line => line.slice(minPrefixLength)).join('\n')
}
