import { GenUtil } from 'js-cutil/dist/base/cutil/GenUtil';
import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';
import { UserInfo } from '@/base/api/UserApi';

export class UserStoreState implements StoreStateInterface {
  userInfo: UserInfo | null = null;

  copyWith(state: { userInfo?: UserInfo | null }): UserStoreState {
    return GenUtil.copyWith(new UserStoreState(), this, state);
  }
}

export class UserStore extends StoreInterface<UserStoreState> {
  constructor() {
    super(() => new UserStoreState());
  }

  /**
   * 设置用户信息
   */
  setUserInfo(userInfo: UserInfo | null): void {
    this.emit(this.state.copyWith({ userInfo }));
  }

  /**
   * 检查是否有全局 API 的编辑权限
   */
  hasGlobalApiPermission(): boolean {
    return (
      this.state.userInfo?.roles.some((role) =>
        ['admin', 'staff'].includes(role)
      ) ?? false
    );
  }
}
