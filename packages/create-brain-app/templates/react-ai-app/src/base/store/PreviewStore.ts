import { GenUtil } from 'js-cutil/dist/base/cutil/GenUtil';
import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';

export class PreviewStoreState implements StoreStateInterface {
  url: string = '';
  showPopup: boolean = false;

  copyWith(state: { url?: string; showPopup?: boolean }): PreviewStoreState {
    return GenUtil.copyWith(new PreviewStoreState(), this, state);
  }
}

/**
 * @description  Preview Store
 */
export class PreviewStore extends StoreInterface<PreviewStoreState> {
  constructor() {
    super(() => new PreviewStoreState());
  }

  /**
   * Close the popup
   */
  closePopup(): void {
    this.emit(this.state.copyWith({ showPopup: false }));
  }

  /**
   * Open the popup
   */
  openPopup(): void {
    this.emit(this.state.copyWith({ showPopup: true }));
  }

  /**
   * Trigger the popup
   */
  triggerPopup(): void {
    this.emit(this.state.copyWith({ showPopup: !this.state.showPopup }));
  }
}
