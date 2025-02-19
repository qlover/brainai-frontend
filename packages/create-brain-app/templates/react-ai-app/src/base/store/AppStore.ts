import { GenUtil } from 'js-cutil/dist/base/cutil/GenUtil';
import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';

export class AppStoreState implements StoreStateInterface {
  lastProjectId: string = '';

  copyWith(state: { lastProjectId?: string }): AppStoreState {
    return GenUtil.copyWith(new AppStoreState(), this, state);
  }
}

/**
 * A store for managing authentication state.
 */
export class AppStore extends StoreInterface<AppStoreState> {
  constructor() {
    super(() => new AppStoreState());
  }

  clearLastProjectId(): void {
    this.emit(this.state.copyWith({ lastProjectId: '' }));
  }

  setLastProjectId(lastProjectId: string): void {
    this.emit(this.state.copyWith({ lastProjectId }));
  }
}
