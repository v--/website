export function fillArcWeightData (graph) {
  const data = new Map()

  for (const arc of graph.iterAllArcs()) {
    data.set(arc, [
      {
        label: 'Arc weight',
        value: arc.weight
      }
    ])
  }

  return data
}
