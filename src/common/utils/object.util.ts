export class ObjectUtil {
  public static assign<T extends object, U extends object>(target: T, source: U): T & U {
    Object.keys(source).forEach((field) => {
      if (source[field] !== undefined) {
        target[field] = source[field];
      }
    });

    return target as T & U;
  }
}
