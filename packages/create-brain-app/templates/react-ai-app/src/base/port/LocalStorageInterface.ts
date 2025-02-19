/**
 * from 'imagica.fot.StorageManager'
 */
export interface LocalStorageInterface<Key, Value> {
  clear(): void;
  getItem(key: Key): Value | null;
  removeItem(key: Key): void;
  setItem(key: Key, value: Value): void;
}
