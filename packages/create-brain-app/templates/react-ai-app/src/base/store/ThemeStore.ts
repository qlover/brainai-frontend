import { GenUtil } from 'js-cutil/dist/base/cutil/GenUtil';
import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';

export class ThemeStoreState implements StoreStateInterface {
  isDarkMode = false;

  copyWith(state: { isDarkMode?: boolean }): ThemeStoreState {
    return GenUtil.copyWith(new ThemeStoreState(), this, state);
  }
}

/**
 * @description
 */
export class ThemeStore extends StoreInterface<ThemeStoreState> {
  constructor() {
    super(() => new ThemeStoreState());
  }

  toggleDarkMode(): void {
    this.emit(this.state.copyWith({ isDarkMode: !this.state.isDarkMode }));
  }
}
