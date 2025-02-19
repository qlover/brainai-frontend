import { AuthStore } from '../store/AuthStore';
import { HistoryInterface } from '../port/HistotyInerface';
import { UserStore } from '../store/UserStore';
import { UserApi } from '../api/UserApi';

/**
 * 1. 如果 localToken 和 urlToken 不存在，则重定向到登录页
 * 2. 如果 localToken 和 urlToken 不一样，则使用 url token 覆盖本地 token
 * 3. 如果 localToken 和 urlToken 一样，则不进行任何操作
 */
export class AuthService {
  constructor(
    private readonly authStore: AuthStore,
    private readonly history: HistoryInterface,
    private readonly userApi: UserApi,
    private readonly userStore: UserStore
  ) {}

  /**
   * 当需要跳转到登录抛出一个错误
   * @param url
   */
  async init(url: URL): Promise<void> {
    this.authStore.setIsInitializing(true);

    // 如果 token 不存在，重定向到登录页
    const token = this.checkToken(url);

    if (!token) {
      throw new Error('Auth Error');
    }
    try {
      // 获取用户信息
      const userInfo = await this.userApi.getCurrentUser();
      this.userStore.setUserInfo(userInfo);
    } catch (error) {
      console.error('Failed to load user info:', error);
      throw new Error('Auth Error');
    }

    // 清理 URL 中可能存在的 token 参数
    this.cleanupTokenFromUrl(url);

    // 所有初始化完成后，设置 isInitializing 为 false
    this.authStore.setIsInitializing(false);
  }

  cloneUrl(url: URL): URL {
    return new URL(url.toString());
  }

  // 清理 URL 中的 token 参数的函数
  cleanupTokenFromUrl(url: URL): void {
    const newUrl = this.cloneUrl(url);
    newUrl.searchParams.delete('token');
    this.history.replaceState({}, '', newUrl.toString());
  }

  checkToken(url: URL): string | undefined {
    // 从 URL 参数获取 token
    const token = url.searchParams.get('token');

    const localToken = this.authStore.getToken();

    if (token || localToken) {
      // 2. 如果 localToken 和 urlToken 不一样，则使用 url token 覆盖本地 token
      if (token && localToken !== token) {
        this.authStore.setToken(token);
        return token;
      }

      // 3. 如果 localToken 和 urlToken 一样，则不进行任何操作
      return localToken;
    }

    // 1. 如果 localToken 和 urlToken 不存在，则不进行任何操作
    return;
  }
}
