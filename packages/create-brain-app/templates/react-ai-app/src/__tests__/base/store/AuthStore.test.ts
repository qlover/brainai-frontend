import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthStore } from '@/base/store/AuthStore';
import { LocalStorageInterface } from '@/base/port/LocalStorageInterface';
import { GetIt } from '@/config/register/GetIt';
import { VitestGetIt } from '@/__mocks__/VitestGetIt';

// 使用 vitest getit 配置
beforeEach(() => {
  GetIt.implement(new VitestGetIt());
});

describe('AuthStore', () => {
  let authStore: AuthStore;
  let mockStorage: LocalStorageInterface<string, string>;

  beforeEach(() => {
    authStore = GetIt.get(AuthStore);
    mockStorage = authStore.getStorage();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(authStore.state.token).toBe('');
      expect(authStore.state.isInitializing).toBe(true);
    });
  });

  describe('setToken', () => {
    it('应该正确设置token并更新localStorage', () => {
      const testToken = 'test-token';
      authStore.setToken(testToken);

      expect(authStore.state.token).toBe(testToken);
      expect(mockStorage.getItem('brainToken')).toBe(testToken);
    });

    it('应该能够更新已存在的token', () => {
      const initialToken = 'initial-token';
      const updatedToken = 'updated-token';

      authStore.setToken(initialToken);
      authStore.setToken(updatedToken);

      expect(authStore.state.token).toBe(updatedToken);
      expect(mockStorage.getItem('brainToken')).toBe(updatedToken);
    });
  });

  describe('getToken', () => {
    it('应该返回state中的token', () => {
      const testToken = 'test-token';
      authStore.setToken(testToken);

      expect(authStore.getToken()).toBe(testToken);
    });

    it('如果state中没有token，应该返回localStorage中的token', () => {
      const storageToken = 'storage-token';
      mockStorage.setItem('brainToken', storageToken);

      expect(authStore.getToken()).toBe(storageToken);
    });

    it('如果没有token，应该返回空字符串', () => {
      expect(authStore.getToken()).toBe('');
    });
  });

  describe('clearToken', () => {
    it('应该清除token并更新localStorage', () => {
      const testToken = 'test-token';
      authStore.setToken(testToken);
      authStore.clearToken();

      expect(authStore.state.token).toBe('');
      expect(mockStorage.getItem('brainToken')).toBeNull();
    });
  });

  describe('setIsInitializing', () => {
    it('应该正确设置初始化状态', () => {
      expect(authStore.state.isInitializing).toBe(true);

      authStore.setIsInitializing(false);
      expect(authStore.state.isInitializing).toBe(false);

      authStore.setIsInitializing(true);
      expect(authStore.state.isInitializing).toBe(true);
    });
  });

  describe('状态订阅', () => {
    it('应该正确触发状态更新', () => {
      const listener = vi.fn();
      const unsubscribe = authStore.observe(listener);

      authStore.setToken('new-token');
      expect(listener).toHaveBeenCalledTimes(1);

      authStore.setIsInitializing(false);
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      authStore.setToken('another-token');
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('应该支持选择器订阅', () => {
      const tokenListener = vi.fn();
      const unsubscribe = authStore.observe(
        (state) => state.token,
        tokenListener
      );

      // token 变化时应该触发
      authStore.setToken('new-token');
      expect(tokenListener).toHaveBeenCalledWith('new-token');

      // isInitializing 变化时不应该触发
      authStore.setIsInitializing(false);
      expect(tokenListener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });
});
