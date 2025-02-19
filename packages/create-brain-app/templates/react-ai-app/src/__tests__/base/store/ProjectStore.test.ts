import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectStore } from '@/base/store/ProjectStore';
import { ProjectResponse } from '@/base/api/ExperimentApi';

describe('ProjectStore', () => {
  let store: ProjectStore;

  beforeEach(() => {
    store = new ProjectStore();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(store.state.properties).toEqual({});
      expect(store.state.metadata).toEqual({ name: '' });
      expect(store.state.hasPreviewUrl).toBe(false);
      expect(store.state.hasPublishUrl).toBe(false);
      expect(store.state.savedCode).toBe('');
    });
  });

  describe('setMetadata', () => {
    it('应该正确设置元数据', () => {
      const metadata: ProjectResponse['metadata'] = {
        name: 'Test Project',
        code: 'test code'
      };
      store.setMetadata(metadata);
      expect(store.state.metadata).toEqual(metadata);
    });
  });

  describe('clear', () => {
    it('应该清空状态到初始值', () => {
      // 先设置一些数据
      store.setMetadata({
        name: 'Test Project',
        code: 'test code'
      });
      store.setHasPreviewUrl(true);

      // 清空状态
      store.clear();

      expect(store.state.metadata).toEqual({ name: '' });
      expect(store.state.hasPreviewUrl).toBe(false);
    });
  });

  describe('setProperties', () => {
    it('应该正确设置属性', () => {
      const properties = {
        publishUrl: 'http://example.com/publish',
        previewUrl: 'http://example.com/preview'
      };
      store.setProperties(properties);
      expect(store.state.properties).toEqual(properties);
    });
  });

  describe('setHasPreviewUrl', () => {
    it('应该正确设置预览URL状态', () => {
      store.setHasPreviewUrl(true);
      expect(store.state.hasPreviewUrl).toBe(true);

      store.setHasPreviewUrl(false);
      expect(store.state.hasPreviewUrl).toBe(false);
    });
  });

  describe('setHasPublishUrl', () => {
    it('应该正确设置发布URL状态', () => {
      store.setHasPublishUrl(true);
      expect(store.state.hasPublishUrl).toBe(true);

      store.setHasPublishUrl(false);
      expect(store.state.hasPublishUrl).toBe(false);
    });
  });

  describe('resetState', () => {
    it('应该重置所有状态到初始值', () => {
      // 先设置一些数据
      store.setMetadata({
        name: 'Test Project',
        code: 'test code'
      });
      store.setProperties({
        publishUrl: 'http://example.com/publish',
        previewUrl: 'http://example.com/preview'
      });
      store.setHasPreviewUrl(true);
      store.setHasPublishUrl(true);
      store.setSavedCode('saved code');

      // 重置状态
      store.resetState();

      // 验证所有状态都恢复到初始值
      expect(store.state.properties).toEqual({});
      expect(store.state.metadata).toEqual({ name: '' });
      expect(store.state.hasPreviewUrl).toBe(false);
      expect(store.state.hasPublishUrl).toBe(false);
      expect(store.state.savedCode).toBe('');
    });
  });

  describe('setSavedCode', () => {
    it('应该正确设置已保存的代码', () => {
      const code = 'test code';
      store.setSavedCode(code);
      expect(store.state.savedCode).toBe(code);
    });
  });

  describe('hasUnsavedChanges', () => {
    it('当metadata.code与savedCode不同时应返回true', () => {
      store.setMetadata({
        name: 'Test Project',
        code: 'new code'
      });
      store.setSavedCode('old code');
      expect(store.hasUnsavedChanges()).toBe(true);
    });

    it('当metadata.code与savedCode相同时应返回false', () => {
      const code = 'same code';
      store.setMetadata({
        name: 'Test Project',
        code
      });
      store.setSavedCode(code);
      expect(store.hasUnsavedChanges()).toBe(false);
    });

    it('当metadata.code为空时应返回false', () => {
      store.setMetadata({
        name: 'Test Project'
      });
      store.setSavedCode('saved code');
      expect(store.hasUnsavedChanges()).toBe(false);
    });
  });

  describe('状态订阅', () => {
    it('应该正确触发状态更新', () => {
      const listener = vi.fn();
      const unsubscribe = store.observe(listener);

      store.setMetadata({ name: 'Test Project' });
      expect(listener).toHaveBeenCalledTimes(1);

      store.setProperties({ publishUrl: 'http://example.com' });
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      store.setSavedCode('test code');
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('应该支持选择器订阅', () => {
      const metadataListener = vi.fn();
      const unsubscribe = store.observe(
        (state) => state.metadata,
        metadataListener
      );

      // metadata 变化时应该触发
      store.setMetadata({ name: 'Test Project' });
      expect(metadataListener).toHaveBeenCalledTimes(1);

      // properties 变化时不应该触发
      store.setProperties({ publishUrl: 'http://example.com' });
      expect(metadataListener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });
});
