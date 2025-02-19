/**
 * common factory method, used to create class instance
 * @template T - return instance type
 * @template Args - constructor params type tuple
 * @param Constructor - class constructor or factory function
 * @param args - constructor params
 * @returns return class instance
 * @example
 * ```
 * // class constructor example
 * interface IUser {
 *   name: string;
 *   age: number;
 * }
 *
 * class User implements IUser {
 *   name: string;
 *   age: number;
 *
 *   constructor(name: string, age: number) {
 *     this.name = name;
 *     this.age = age;
 *   }
 * }
 *
 * const user = factory(User, "张三", 25);
 *
 * // factory function example
 * const createUser = (name: string, age: number): IUser => ({
 *   name,
 *   age
 * });
 *
 * const user2 = factory(createUser, "李四", 30);
 * ```
 */
export function factory<T, Args extends unknown[]>(
  Constructor: (new (...args: Args) => T) | ((...args: Args) => T),
  ...args: Args
): T {
  // check Constructor is class constructor
  if (
    typeof Constructor === 'function' &&
    Constructor.prototype &&
    Constructor.prototype.constructor === Constructor
  ) {
    return new (Constructor as new (...args: Args) => T)(...args);
  }
  // if it is a normal function, call it directly
  return (Constructor as (...args: Args) => T)(...args);
}
