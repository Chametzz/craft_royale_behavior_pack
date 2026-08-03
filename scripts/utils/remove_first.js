/**
 * @template T
 * @param { T[] } array
 * @param { (item: T, index: number) => boolean } predicate
 * @returns { T | undefined }
 */
export function removeFirst(array, predicate) {
  const index = array.findIndex(predicate);
  if (index !== -1) {
    return array.splice(index, 1)[0];
  }
  return undefined;
}
