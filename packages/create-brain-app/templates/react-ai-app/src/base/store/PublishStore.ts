import { GenUtil } from 'js-cutil/dist/base/cutil/GenUtil';
import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';

export class PublishStoreState implements StoreStateInterface {
  publishLoading = false;
  unPublishLoading = false;

  publishedUrl = '';
  showPublishPopup = false;

  publishError: string | null = null;

  copyWith(state: {
    publishLoading?: boolean;
    unPublishLoading?: boolean;
    publishedUrl?: string;
    showPublishPopup?: boolean;
    publishError?: string | null;
  }): PublishStoreState {
    return GenUtil.copyWith(new PublishStoreState(), this, state);
  }
}

/**
 * @description Publish Store
 */
export class PublishStore extends StoreInterface<PublishStoreState> {
  constructor() {
    super(() => new PublishStoreState());
  }

  startLoading(): void {
    this.emit(this.state.copyWith({ publishLoading: true }));
  }

  stopLoading(): void {
    this.emit(this.state.copyWith({ publishLoading: false }));
  }

  setUnPublishLoading(unPublishLoading: boolean): void {
    this.emit(this.state.copyWith({ unPublishLoading }));
  }

  changePublishedUrl(publishedUrl: string): void {
    this.emit(this.state.copyWith({ publishedUrl }));
  }

  clearPublishedUrl(): void {
    this.emit(
      this.state.copyWith({
        publishedUrl: '',
        // 关闭发布弹窗
        showPublishPopup: false
      })
    );
  }

  openPublishPopup(url?: string): void {
    this.emit(
      this.state.copyWith({
        showPublishPopup: true,
        publishedUrl: url || this.state.publishedUrl
      })
    );
  }

  closePublishPopup(): void {
    this.emit(
      this.state.copyWith({
        showPublishPopup: false,
        publishedUrl: ''
      })
    );
  }

  setPublishError(publishError: string | null): void {
    this.emit(this.state.copyWith({ publishError }));
  }
}
