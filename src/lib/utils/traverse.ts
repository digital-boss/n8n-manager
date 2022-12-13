export type VisitorFn<T> = (o: T, path: Array<string | number>) => void;

const traverseInternal = <T>(
	sourceObj: T,
  fn: VisitorFn<T>,
	value: unknown,
	path: Array<string | number>,
): void => {
	fn(sourceObj, path);
  if (value instanceof Array) {
    value.forEach((v, idx) => traverseInternal(sourceObj, fn, v, [...path, idx]))
	} else if (value !== null && typeof value === 'object') {
    Object.entries(value)
			.forEach(([k, v]) => traverseInternal(sourceObj, fn, v, [...path, k]));
	}
};

export const traverse = <T>(sourceObj: T, fn: VisitorFn<T>) => traverseInternal(sourceObj, fn, sourceObj, []);

export const setValue = <T extends any>(obj: T, path: Array<string | number>, value: string | number) => {
  if (path.length === 0) {
    return;
  }

  const o: any = path.slice(0, -1).reduce((acc: any, i) => {
    acc = acc[i];
    return acc;
  }, obj);

  const prop = path[path.length-1];
  o[prop] = value;
}