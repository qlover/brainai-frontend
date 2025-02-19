import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppStore } from '@/base/store/AppStore';
import { GetIt } from '@/config/register/GetIt';
import { VitestGetIt } from '@/__mocks__/VitestGetIt';

// 使用 vitest getit 配置
beforeEach(() => {
  GetIt.implement(new VitestGetIt());
});

describe('AppStore', () => {
  let appStore: AppStore;

  beforeEach(() => {
    appStore = GetIt.get(AppStore);
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(appStore.state.lastProjectId).toBe('');
    });
  });

  describe('setLastProjectId', () => {
    it('应该正确设置lastProjectId', () => {
      const testProjectId = 'test-project-id';
      appStore.setLastProjectId(testProjectId);

      expect(appStore.state.lastProjectId).toBe(testProjectId);
    });

    it('应该能够更新已存在的lastProjectId', () => {
      const initialProjectId = 'initial-project-id';
      const updatedProjectId = 'updated-project-id';

      appStore.setLastProjectId(initialProjectId);
      appStore.setLastProjectId(updatedProjectId);

      expect(appStore.state.lastProjectId).toBe(updatedProjectId);
    });
  });

  describe('clearLastProjectId', () => {
    it('应该清除lastProjectId', () => {
      const testProjectId = 'test-project-id';
      appStore.setLastProjectId(testProjectId);
      appStore.clearLastProjectId();

      expect(appStore.state.lastProjectId).toBe('');
    });
  });

  describe('状态订阅', () => {
    it('应该正确触发状态更新', () => {
      const listener = vi.fn();
      const unsubscribe = appStore.observe(listener);

      appStore.setLastProjectId('new-project-id');
      expect(listener).toHaveBeenCalledTimes(1);

      appStore.clearLastProjectId();
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      appStore.setLastProjectId('another-project-id');
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('应该支持选择器订阅', () => {
      const projectIdListener = vi.fn();
      const unsubscribe = appStore.observe(
        (state) => state.lastProjectId,
        projectIdListener
      );

      // lastProjectId 变化时应该触发
      appStore.setLastProjectId('new-project-id');
      expect(projectIdListener).toHaveBeenCalledWith('new-project-id');

      // 清除 lastProjectId 时也应该触发
      appStore.clearLastProjectId();
      expect(projectIdListener).toHaveBeenCalledWith('');

      unsubscribe();
      appStore.setLastProjectId('another-project-id');
      expect(projectIdListener).toHaveBeenCalledTimes(2);
    });

    it('应该正确处理多个订阅', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = appStore.observe(listener1);
      const unsubscribe2 = appStore.observe(listener2);

      appStore.setLastProjectId('test-project-id');
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      unsubscribe1();
      appStore.clearLastProjectId();
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(2);

      unsubscribe2();
      appStore.setLastProjectId('another-project-id');
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(2);
    });
  });

  describe('状态不可变性', () => {
    it('更新状态时应该返回新的状态对象', () => {
      const initialState = appStore.state;
      appStore.setLastProjectId('test-project-id');

      expect(appStore.state).not.toBe(initialState);
      expect(initialState.lastProjectId).toBe('');
      expect(appStore.state.lastProjectId).toBe('test-project-id');
    });

    it('清除状态时应该返回新的状态对象', () => {
      appStore.setLastProjectId('test-project-id');
      const stateBeforeClear = appStore.state;

      appStore.clearLastProjectId();
      expect(appStore.state).not.toBe(stateBeforeClear);
      expect(stateBeforeClear.lastProjectId).toBe('test-project-id');
      expect(appStore.state.lastProjectId).toBe('');
    });
  });
});
