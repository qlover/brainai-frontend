import { MermoryStorage } from '@/__mocks__/infra/MermoryStorage';
import { BrowserGetIt } from '@/config/register/BrowserGetIt';
import { ServiceIdentifier } from '@/base/port/GetItContainerInterface';
import { AuthStore } from '@/base/store/AuthStore';
import { TestFetcher } from './infra/TestFetcher';

/**
 * 测试环境的依赖注入容器实现
 *
 * 主要为了覆盖 BrowserGetIt 中对外部的依赖
 *
 * 例如 LocalStorageInterface 用于保存数据到 localStorage 中
 */
export class VitestGetIt extends BrowserGetIt {
  constructor() {
    super({
      storage: new MermoryStorage(),
      // 测试环境使用 TestFetcher 来模拟 fetch 请求
      fetcher: new TestFetcher()
    });
  }

  override<T>(serviceIdentifier: ServiceIdentifier<T>, _value: T): void {
    // 如果是 AuthStore 则可以在这里手动去覆盖，
    // 可以不通过构造器传递不同的参数来直接绑定实例
    if (serviceIdentifier === AuthStore) {
      this.bind(AuthStore, new AuthStore(new MermoryStorage()));
    }
  }

  getFetcher(): TestFetcher {
    return this.dependencies.fetcher as TestFetcher;
  }
}
