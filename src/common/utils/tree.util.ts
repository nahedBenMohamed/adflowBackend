export const flattenTree = <T>(
  root: T | T[],
  accessor: (item: T) => T | T[] | null | undefined,
  depthFirst = true,
): T[] => {
  const result: T[] = [];
  const queue: T[] = Array.isArray(root) ? [...root] : [root];

  while (queue.length > 0) {
    const current = depthFirst ? queue.pop() : queue.shift();
    result.push(current);

    const children = accessor(current);
    if (children) {
      const items = Array.isArray(children) ? children : [children];
      if (depthFirst) {
        queue.push(...items.reverse());
      } else {
        queue.unshift(...items);
      }
    }
  }

  return result;
};
