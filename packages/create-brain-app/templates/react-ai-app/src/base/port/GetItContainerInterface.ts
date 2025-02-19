export interface Abstract<T> {
  prototype: T;
}
export type Newable<T, Args extends unknown[] = unknown[]> = new (
  ...args: Args
) => T;

export type ServiceIdentifier<T = unknown> =
  | string
  | symbol
  | Newable<T>
  | Abstract<T>;

/**
 * 依赖注入容器接口
 *
 * 为了适配测试环境， 需要实现一个测试环境的依赖注入容器
 * 测试环境使用 VitestGetIt
 * 生产环境使用 BrowserGetIt
 */
export interface GetItContainerInterface {
  /**
   * 配置
   */
  configure(): void;

  /**
   * 绑定实例
   *
   * @param serviceIdentifier
   * @param value
   */
  bind<T>(serviceIdentifier: ServiceIdentifier<T>, value: T): void;

  /**
   * 获取实例
   *
   * @param serviceIdentifier
   * @returns
   */
  get<T>(serviceIdentifier: ServiceIdentifier<T>): T;

  /**
   * 你也可以使用 override 方法在运行时指定覆盖
   *
   * 不过他在性能上可能存在不足，因为他会额外创建一个实例
   *
   * @param serviceIdentifier
   * @param value
   */
  override<T>(serviceIdentifier: ServiceIdentifier<T>, value: T): void;
}

export interface RegisterInterface {
  configure(container: GetItContainerInterface): void;
}
