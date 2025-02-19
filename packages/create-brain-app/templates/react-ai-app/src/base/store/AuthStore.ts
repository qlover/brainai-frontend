import { GenUtil } from 'js-cutil/dist/base/cutil/GenUtil';
import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';
import { LocalStorageInterface } from '../port/LocalStorageInterface';

export class AuthStoreState implements StoreStateInterface {
  token: string = '';
  /**
   * 是否正在初始化, 初始化完成后，会设置为 false
   */
  isInitializing: boolean = true;

  copyWith(state: {
    token?: string;
    isInitializing?: boolean;
  }): AuthStoreState {
    return GenUtil.copyWith(new AuthStoreState(), this, state);
  }
}

/**
 * A store for managing authentication state.
 */
export class AuthStore extends StoreInterface<AuthStoreState> {
  constructor(private storage: LocalStorageInterface<string, string>) {
    super(() => new AuthStoreState());
  }

  get tokenKey(): string {
    return 'brainToken';
  }

  setToken(token: string): void {
    this.storage.setItem(this.tokenKey, token);
    this.emit(this.state.copyWith({ token }));
  }

  getToken(): string {
    return this.state.token || this.storage.getItem(this.tokenKey) || '';
  }

  clearToken(): void {
    this.storage.removeItem('brainToken');
    this.emit(this.state.copyWith({ token: '' }));
  }

  setIsInitializing(isInitializing: boolean): void {
    this.emit(this.state.copyWith({ isInitializing }));
  }

  getStorage(): LocalStorageInterface<string, string> {
    return this.storage;
  }
}
