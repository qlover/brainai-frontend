import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '@/base/services/AuthService';
import { AuthStore } from '@/base/store/AuthStore';
import { HistoryInterface } from '@/base/port/HistotyInerface';
import { UserStore } from '@/base/store/UserStore';
import { UserApi, UserInfo } from '@/base/api/UserApi';
import { LocalStorageInterface } from '@/base/port/LocalStorageInterface';

// 模拟 LocalStorage
class MockLocalStorage implements LocalStorageInterface<string, string> {
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

// 模拟 History
class MockHistory implements HistoryInterface {
  currentUrl: string = '';
  length: number = 0;
  state: unknown = null;
  scrollRestoration: ScrollRestoration = 'auto';

  replaceState(data: unknown, _unused: string, url: string): void {
    this.currentUrl = url;
    this.state = data;
  }

  pushState(data: unknown, _unused: string, url: string): void {
    this.currentUrl = url;
    this.state = data;
    this.length++;
  }

  back(): void {
    // 空实现，因为测试中不需要
  }

  forward(): void {
    // 空实现，因为测试中不需要
  }

  go(): void {
    // 空实现，因为测试中不需要
  }
}

describe('AuthService', () => {
  let authService: AuthService;
  let authStore: AuthStore;
  let mockStorage: MockLocalStorage;
  let mockHistory: MockHistory;
  let userApi: UserApi;
  let userStore: UserStore;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    vi.spyOn(mockStorage, 'setItem');
    mockHistory = new MockHistory();
    authStore = new AuthStore(mockStorage);
    userApi = {
      getCurrentUser: vi.fn()
    } as unknown as UserApi;
    userStore = {
      setUserInfo: vi.fn()
    } as unknown as UserStore;

    authService = new AuthService(authStore, mockHistory, userApi, userStore);
  });

  describe('init', () => {
    it('当没有token时应该抛出错误', async () => {
      const url = new URL('http://example.com/');
      await expect(authService.init(url)).rejects.toThrow('Auth Error');
      expect(authStore.state.isInitializing).toBe(true);
    });

    it('当获取用户信息失败时应该抛出错误', async () => {
      const url = new URL('http://example.com/?token=test-token');
      vi.spyOn(userApi, 'getCurrentUser').mockRejectedValue(
        new Error('API Error')
      );

      await expect(authService.init(url)).rejects.toThrow('Auth Error');
      expect(authStore.state.isInitializing).toBe(true);
    });

    it('当有token且获取用户信息成功时应该正确初始化', async () => {
      const url = new URL('http://example.com/?token=test-token');
      const mockUserInfo = {
        id: '1',
        name: 'Test User'
      } as unknown as UserInfo;
      vi.spyOn(userApi, 'getCurrentUser').mockResolvedValue(mockUserInfo);

      await authService.init(url);

      expect(userApi.getCurrentUser).toHaveBeenCalled();
      expect(userStore.setUserInfo).toHaveBeenCalledWith(mockUserInfo);
      expect(mockHistory.currentUrl).toBe('http://example.com/');
      expect(authStore.state.isInitializing).toBe(false);
    });
  });

  describe('checkToken', () => {
    it('当url token和local token不同时应该使用url token', () => {
      const url = new URL('http://example.com/?token=url-token');
      authStore.setToken('local-token');

      const result = authService.checkToken(url);

      expect(result).toBe('url-token');
      expect(authStore.getToken()).toBe('url-token');
    });

    it('当url token和local token相同时不应该更新token', () => {
      const token = 'same-token';
      const url = new URL(`http://example.com/?token=${token}`);
      authStore.setToken(token);

      const result = authService.checkToken(url);

      expect(result).toBe(token);
      expect(authStore.getToken()).toBe(token);
    });

    it('当只有local token时应该返回local token', () => {
      const url = new URL('http://example.com/');
      authStore.setToken('local-token');

      const result = authService.checkToken(url);

      expect(result).toBe('local-token');
    });

    it('当没有任何token时应该返回undefined', () => {
      const url = new URL('http://example.com/');
      const result = authService.checkToken(url);

      expect(result).toBeUndefined();
    });
  });

  describe('cleanupTokenFromUrl', () => {
    it('应该正确清理URL中的token参数', () => {
      const url = new URL('http://example.com/?token=test&other=param');
      authService.cleanupTokenFromUrl(url);

      expect(mockHistory.currentUrl).toBe('http://example.com/?other=param');
    });

    it('当URL中没有token参数时不应该改变URL', () => {
      const url = new URL('http://example.com/?other=param');
      authService.cleanupTokenFromUrl(url);

      expect(mockHistory.currentUrl).toBe('http://example.com/?other=param');
    });
  });

  describe('cloneUrl', () => {
    it('应该正确克隆URL对象', () => {
      const originalUrl = new URL('http://example.com/?token=test');
      const clonedUrl = authService.cloneUrl(originalUrl);

      expect(clonedUrl.toString()).toBe(originalUrl.toString());
      expect(clonedUrl).not.toBe(originalUrl); // 确保是新的实例
    });
  });
});
