/**
 * Unified Browser History Interface
 *
 * from window.history
 */
export interface HistoryInterface {
  replaceState(data: unknown, unused: string, url?: string): void;
  pushState(data: unknown, unused: string, url?: string): void;
  back(): void;
  forward(): void;
  go(delta: number): void;
  length: number;
  state: unknown;
}
