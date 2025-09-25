export const propagateData = <T extends { id: number; subordinates: T[] }, R extends { add: (r: R) => R }>(
  hierarchy: T[],
  rowsMap: Map<number, R>,
  initializer: (ownerId: number) => R,
) => {
  const propagateSubordinates = (node: T): R | null => {
    let aggregatedRow = rowsMap.get(node.id) || initializer(node.id);

    let hasValue = rowsMap.has(node.id);
    node.subordinates.forEach((subordinate) => {
      const subordinateRow = propagateSubordinates(subordinate);
      if (subordinateRow) {
        aggregatedRow = aggregatedRow.add(subordinateRow);
        hasValue = true;
      }
    });
    return hasValue ? aggregatedRow : null;
  };

  hierarchy.forEach((node) => {
    const aggregatedRow = propagateSubordinates(node);
    if (aggregatedRow) {
      rowsMap.set(node.id, aggregatedRow);
    }
  });
};
