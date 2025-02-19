import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';
import { useSliceStore } from '@qlover/slice-store-react';

/**
 * 为了强制类型，使用这个函数
 */
export function useStore<
  C extends StoreInterface<StoreStateInterface>,
  State = C['state']
>(store: C, selector?: (state: C['state']) => State): State {
  return useSliceStore(store, selector);
}
