import {
  GetItContainerInterface,
  ServiceIdentifier
} from '@/base/port/GetItContainerInterface';

export class GetIt {
  private static implementation: GetItContainerInterface;

  static get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
    if (!GetIt.implementation) {
      throw new Error('GetItContainer is not configured');
    }

    return GetIt.implementation.get(serviceIdentifier);
  }

  static implement(impl: GetItContainerInterface): void {
    GetIt.implementation = impl;

    // 你也可以直接打开配置，不在运行时配置
    // 例如在测试环境中，你可以在 beforeEach 中配置，当调用到了 get 方式时自动配置
    // impl.configure();
  }
}
