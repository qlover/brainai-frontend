import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PublishStore } from '@/base/store/PublishStore';

describe('PublishStore', () => {
  let store: PublishStore;

  beforeEach(() => {
    store = new PublishStore();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(store.state.publishLoading).toBe(false);
      expect(store.state.unPublishLoading).toBe(false);
      expect(store.state.publishedUrl).toBe('');
      expect(store.state.showPublishPopup).toBe(false);
    });
  });

  describe('startLoading', () => {
    it('应该正确设置发布加载状态', () => {
      store.startLoading();
      expect(store.state.publishLoading).toBe(true);
    });
  });

  describe('stopLoading', () => {
    it('应该正确停止发布加载状态', () => {
      store.startLoading();
      store.stopLoading();
      expect(store.state.publishLoading).toBe(false);
    });
  });

  describe('setUnPublishLoading', () => {
    it('应该正确设置取消发布的加载状态', () => {
      store.setUnPublishLoading(true);
      expect(store.state.unPublishLoading).toBe(true);

      store.setUnPublishLoading(false);
      expect(store.state.unPublishLoading).toBe(false);
    });
  });

  describe('changePublishedUrl', () => {
    it('应该正确更新已发布的URL', () => {
      const url = 'https://example.com';
      store.changePublishedUrl(url);
      expect(store.state.publishedUrl).toBe(url);
    });
  });

  describe('clearPublishedUrl', () => {
    it('应该清空已发布的URL并关闭弹窗', () => {
      store.changePublishedUrl('https://example.com');
      store.openPublishPopup();

      store.clearPublishedUrl();

      expect(store.state.publishedUrl).toBe('');
      expect(store.state.showPublishPopup).toBe(false);
    });
  });

  describe('openPublishPopup', () => {
    it('应该打开发布弹窗并保持当前URL', () => {
      const url = 'https://example.com';
      store.changePublishedUrl(url);
      store.openPublishPopup();

      expect(store.state.showPublishPopup).toBe(true);
      expect(store.state.publishedUrl).toBe(url);
    });

    it('应该打开发布弹窗并使用新的URL', () => {
      const newUrl = 'https://new-example.com';
      store.openPublishPopup(newUrl);

      expect(store.state.showPublishPopup).toBe(true);
      expect(store.state.publishedUrl).toBe(newUrl);
    });
  });

  describe('closePublishPopup', () => {
    it('应该关闭发布弹窗并清空URL', () => {
      store.openPublishPopup('https://example.com');
      store.closePublishPopup();

      expect(store.state.showPublishPopup).toBe(false);
      expect(store.state.publishedUrl).toBe('');
    });
  });

  describe('状态订阅', () => {
    it('应该正确触发状态更新', () => {
      const listener = vi.fn();
      const unsubscribe = store.observe(listener);

      store.startLoading();
      expect(listener).toHaveBeenCalledTimes(1);

      store.changePublishedUrl('https://example.com');
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      store.stopLoading();
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('应该支持选择器订阅', () => {
      const publishLoadingListener = vi.fn();
      const unsubscribe = store.observe(
        (state) => state.publishLoading,
        publishLoadingListener
      );

      // publishLoading 变化时应该触发
      store.startLoading();
      expect(publishLoadingListener).toHaveBeenCalledTimes(1);

      // publishedUrl 变化时不应该触发
      store.changePublishedUrl('https://example.com');
      expect(publishLoadingListener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });
});
