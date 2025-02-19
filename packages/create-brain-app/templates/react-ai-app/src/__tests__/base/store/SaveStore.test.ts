import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveStore } from '@/base/store/SaveStore';

describe('SaveStore', () => {
  let store: SaveStore;

  beforeEach(() => {
    store = new SaveStore();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(store.state.saveLoading).toBe(false);
    });
  });

  describe('startLoading', () => {
    it('应该正确设置加载状态为true', () => {
      store.startLoading();
      expect(store.state.saveLoading).toBe(true);
    });
  });

  describe('stopLoading', () => {
    it('应该正确设置加载状态为false', () => {
      store.state.saveLoading = true;
      store.stopLoading();
      expect(store.state.saveLoading).toBe(false);
    });
  });

  describe('状态订阅', () => {
    it('应该正确触发状态更新', () => {
      const listener = vi.fn();
      const unsubscribe = store.observe(listener);

      store.startLoading();
      expect(listener).toHaveBeenCalledTimes(1);

      store.stopLoading();
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      store.startLoading();
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('应该支持选择器订阅', () => {
      const loadingListener = vi.fn();
      const unsubscribe = store.observe(
        (state) => state.saveLoading,
        loadingListener
      );

      // saveLoading 变化时应该触发
      store.startLoading();
      expect(loadingListener).toHaveBeenCalledTimes(1);
      expect(loadingListener).toHaveBeenCalledWith(true);

      store.stopLoading();
      expect(loadingListener).toHaveBeenCalledTimes(2);
      expect(loadingListener).toHaveBeenCalledWith(false);

      unsubscribe();
    });
  });
});
