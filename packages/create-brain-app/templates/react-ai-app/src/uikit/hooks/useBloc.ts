import { BlocInterface } from '@/base/port/BlocInterface';
import { useCreation } from 'ahooks';
import { factory } from '../utils/factory';

/**
 * A custom React Hook for creating and managing Bloc instances within React components.
 *
 * This is a factory method for creating a Bloc instance.
 *
 * @template State - The type of state managed by the Bloc
 * @template Bloc - The Bloc type that extends BlocInterface
 * @template Args - Array of constructor argument types for the Bloc
 *
 * @param BlocInterface - The constructor function for the Bloc class
 * @param args - Arguments passed to the Bloc constructor, is constructor init params, only used on first render
 *
 * @returns A Bloc instance that remains constant throughout the component lifecycle
 *
 * @example
 * ```tsx
 * const myBloc = useBloc(MyBloc, arg1, arg2);
 * ```
 *
 * @example not args
 * ```tsx
 * const myBloc = useBloc(MyBloc);
 * ```
 *
 * @description
 * - Uses useRef to maintain the same Bloc instance across component re-renders
 * - Initializes the Bloc only on first render and reuses the instance on subsequent re-renders
 * - Suitable for managing component state and business logic
 * - bloc only created once, don't need to re-create it on every render
 * - **if update contructor args, please call setter**
 */
export function useBloc<
  State,
  Bloc extends BlocInterface<State>,
  P extends unknown[] = ConstructorParameters<new (...args: unknown[]) => Bloc>
>(BlocClass: new (...params: P) => Bloc, ...params: P): Bloc {
  // bloc only created once, don't need to re-create it on every render
  const bloc = useCreation(() => factory(BlocClass, ...params), []);

  return bloc;
}
