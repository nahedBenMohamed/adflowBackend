export const isUnique = <T>(value: T, index: number, self: T[]): boolean => {
  return self.indexOf(value) === index;
};

export const intersection = <T>(arr1: T[] | null | undefined, arr2: T[] | null | undefined): T[] | undefined => {
  return arr1 && arr2 ? arr1.filter((id) => arr2.includes(id)) : (arr1 ?? arr2 ?? undefined);
};
