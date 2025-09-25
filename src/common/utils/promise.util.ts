export const withTimeout = <T>(promise: Promise<T>, ms: number, timeoutResult?: T): Promise<T> => {
  const timeout = new Promise<T>((resolve) => setTimeout(() => resolve(timeoutResult), ms));

  return Promise.race([promise, timeout]);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
