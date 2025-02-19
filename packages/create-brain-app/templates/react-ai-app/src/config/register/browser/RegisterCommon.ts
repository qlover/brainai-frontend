import {
  GetItContainerInterface,
  RegisterInterface
} from '@/base/port/GetItContainerInterface';
import { LocalStorageInterface } from '@/base/port/LocalStorageInterface';
import { AppStore } from '@/base/store/AppStore';
import { AuthStore } from '@/base/store/AuthStore';
import { PreviewStore } from '@/base/store/PreviewStore';
import { ProjectStore } from '@/base/store/ProjectStore';
import { PublishStore } from '@/base/store/PublishStore';
import { SaveStore } from '@/base/store/SaveStore';
import { ThemeStore } from '@/base/store/ThemeStore';
import { UserStore } from '@/base/store/UserStore';
import { XYFlowStore } from '@/base/store/XYFlowStore';

export class RegisterCommon implements RegisterInterface {
  constructor(private storage: LocalStorageInterface<string, string>) {}

  configure(container: GetItContainerInterface): void {
    container.bind(XYFlowStore, new XYFlowStore());
    // 允许在运行时重写
    container.override(AuthStore, new AuthStore(this.storage));
    container.bind(ProjectStore, new ProjectStore());
    container.bind(PreviewStore, new PreviewStore());
    container.bind(PublishStore, new PublishStore());
    container.bind(SaveStore, new SaveStore());
    container.bind(ThemeStore, new ThemeStore());
    container.bind(AppStore, new AppStore());
    container.bind(UserStore, new UserStore());
  }
}
