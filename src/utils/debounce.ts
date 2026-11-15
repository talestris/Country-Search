export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>): void => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
