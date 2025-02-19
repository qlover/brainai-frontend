import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PreviewStore, PreviewStoreState } from '@/base/store/PreviewStore';

describe('PreviewStore', () => {
  let store: PreviewStore;

  beforeEach(() => {
    store = new PreviewStore();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(store.state.url).toBe('');
      expect(store.state.showPopup).toBe(false);
    });
  });

  describe('状态操作', () => {
    describe('copyWith', () => {
      it('应该创建包含更新值的新状态', () => {
        const state = new PreviewStoreState();
        const newState = state.copyWith({ url: 'test.com', showPopup: true });

        expect(newState.url).toBe('test.com');
        expect(newState.showPopup).toBe(true);
      });

      it('未指定的值应保持不变', () => {
        const state = new PreviewStoreState();
        state.url = 'test.com';
        state.showPopup = true;

        const newState = state.copyWith({ url: 'new.com' });

        expect(newState.url).toBe('new.com');
        expect(newState.showPopup).toBe(true);
      });
    });
  });

  describe('状态订阅', () => {
    it('应该正确触发状态更新', () => {
      const listener = vi.fn();
      const unsubscribe = store.observe(listener);

      store.openPopup();
      expect(listener).toHaveBeenCalledTimes(1);

      store.closePopup();
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      store.triggerPopup();
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('应该支持选择器订阅', () => {
      const showPopupListener = vi.fn();
      const unsubscribe = store.observe(
        (state) => state.showPopup,
        showPopupListener
      );

      // showPopup 变化时应该触发
      store.openPopup();
      expect(showPopupListener).toHaveBeenCalledTimes(1);

      // url 变化时不应该触发
      store.emit(store.state.copyWith({ url: 'test.com' }));
      expect(showPopupListener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });

  describe('actions', () => {
    it('closePopup 应该设置 showPopup 为 false', () => {
      store.state.showPopup = true;
      store.closePopup();
      expect(store.state.showPopup).toBe(false);
    });

    it('openPopup 应该设置 showPopup 为 true', () => {
      store.state.showPopup = false;
      store.openPopup();
      expect(store.state.showPopup).toBe(true);
    });

    it('triggerPopup 应该切换 showPopup 值', () => {
      expect(store.state.showPopup).toBe(false);

      store.triggerPopup();
      expect(store.state.showPopup).toBe(true);

      store.triggerPopup();
      expect(store.state.showPopup).toBe(false);
    });
  });
});
