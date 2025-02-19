import {
  GetItContainerInterface,
  ServiceIdentifier
} from '@/base/port/GetItContainerInterface';
import { RegisterCommon } from './browser/RegisterCommon';
import { RegisterApi } from './browser/RegisterApi';
import { RegisterServices } from './browser/RegisterServices';
import { LocalStorageInterface } from '@/base/port/LocalStorageInterface';
import { FetcherInterface } from '@/base/port/FetcherInterface';
import { BrowserFetch } from '@/infra/BrowserFetch';

/**
 * 对依赖的抽象类型
 */
export interface GetItDependencies {
  storage: LocalStorageInterface<string, string>;

  /**
   * 用于测试的 fetch 实现
   */
  fetcher: FetcherInterface;
}

/**
 * 默认的浏览器环境依赖
 *
 * 它可能包含 window, document, localStorage 等浏览器环境下的对象
 */
class DefaultBrowserDependencies implements GetItDependencies {
  storage: LocalStorageInterface<string, string> = window.localStorage;
  fetcher: FetcherInterface = new BrowserFetch();
}

/**
 * 生产环境的依赖注入容器实现
 */
export class BrowserGetIt implements GetItContainerInterface {
  private container: Map<ServiceIdentifier, unknown> = new Map();

  protected dependencies: GetItDependencies;

  constructor(dependencies?: Partial<GetItDependencies>) {
    this.dependencies = Object.assign(
      {},
      new DefaultBrowserDependencies(),
      dependencies
    );
  }

  /**
   * @override
   */
  configure(): void {
    new RegisterCommon(this.dependencies.storage).configure(this);
    new RegisterApi(this.dependencies).configure(this);
    new RegisterServices().configure(this);
  }

  /**
   * @override
   */
  bind<T>(serviceIdentifier: ServiceIdentifier<T>, value: T): void {
    this.container.set(serviceIdentifier, value);
  }

  /**
   * @override
   */
  get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
    if (this.container.size === 0) {
      this.configure();
    }

    return this.container.get(serviceIdentifier) as T;
  }

  /**
   * @override
   */
  override<T>(serviceIdentifier: ServiceIdentifier<T>, value: T): void {
    this.bind(serviceIdentifier, value);
  }
}
