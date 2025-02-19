import { GenUtil } from 'js-cutil/dist/base/cutil/GenUtil';
import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';

export class SaveStoreState implements StoreStateInterface {
  saveLoading = false;

  copyWith(state: { saveLoading?: boolean }): SaveStoreState {
    return GenUtil.copyWith(new SaveStoreState(), this, state);
  }
}

/**
 * @description Publish Store
 */
export class SaveStore extends StoreInterface<SaveStoreState> {
  constructor() {
    super(() => new SaveStoreState());
  }

  startLoading(): void {
    this.emit(this.state.copyWith({ saveLoading: true }));
  }

  stopLoading(): void {
    this.emit(this.state.copyWith({ saveLoading: false }));
  }
}
