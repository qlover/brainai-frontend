import { LocalStorageInterface } from '@/base/port/LocalStorageInterface';

/**
 * 内存存储
 */
export class MermoryStorage implements LocalStorageInterface<string, string> {
  private store: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}
